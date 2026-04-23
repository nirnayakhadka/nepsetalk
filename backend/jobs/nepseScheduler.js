/**
 * jobs/nepseScheduler.js  (UPDATED)
 *
 * Cron schedule (NST = UTC+5:45):
 *   Market hours (11:00-15:00 NST Sun-Thu):  every 5 min  → live prices
 *   Morning open  11:05 NST → full fetch including floorsheet
 *   Midday        13:00 NST → prices + indices
 *   Closing       15:05 NST → full fetch + floorsheet
 *   Daily  21:00 NST        → company list + broker list (master data)
 *   Weekly Mon 06:00 NST    → sector PE (nepsealpha, slower data)
 */

const cron = require('node-cron');
const cache = require('../config/redis');
const { fetchLiveData, fetchAllNepseData, fetchNepalstockFloorsheet, fetchNepalstockCompanyList, fetchNepalstockBrokers } = require('../services/nepseDataService');
const { saveSnapshot, saveFloorsheet, saveCompanies, saveBrokers } = require('../services/nepseSaveService');

const CACHE_KEY   = 'nepse:live';
const CACHE_TTL   = {
  marketHours: 5 * 60,
  afterHours:  30 * 60,
  scheduled:   10 * 60,
};

let isFetching = false;

// ─── Core fetch + cache + save ─────────────────────────────────────────────
async function runFetch(schedule = 'scheduled') {
  if (isFetching) {
    console.log('[Scheduler] Skipping — previous fetch still running');
    return;
  }
  isFetching = true;
  try {
    console.log(`[Scheduler] Running ${schedule} fetch…`);
    const data = await fetchLiveData();
    data.fetchSchedule = schedule;

    const ttl = isMarketHours() ? CACHE_TTL.marketHours : CACHE_TTL.afterHours;
    await cache.setJSON(CACHE_KEY, data, ttl);
    await saveSnapshot(data);

    console.log(`[Scheduler] ${schedule} fetch done. Index: ${data.marketIndex?.value}`);
    return data;
  } catch (err) {
    console.error(`[Scheduler] ${schedule} fetch error:`, err.message);
    return null;
  } finally {
    isFetching = false;
  }
}

async function runFloorsheetFetch() {
  try {
    console.log('[Scheduler] Fetching floorsheet…');
    const payload = await fetchNepalstockFloorsheet(0, 2000);
    await saveFloorsheet(payload);
    console.log('[Scheduler] Floorsheet saved');
  } catch (err) {
    console.error('[Scheduler] Floorsheet fetch error:', err.message);
  }
}

async function runMasterDataFetch() {
  try {
    console.log('[Scheduler] Fetching master data (companies + brokers)…');
    const [companies, brokers] = await Promise.allSettled([
      fetchNepalstockCompanyList(),
      fetchNepalstockBrokers(),
    ]);
    if (companies.status === 'fulfilled') await saveCompanies(companies.value);
    if (brokers.status  === 'fulfilled') await saveBrokers(brokers.value);
    console.log('[Scheduler] Master data saved');
  } catch (err) {
    console.error('[Scheduler] Master data error:', err.message);
  }
}

// ─── Is market open right now? ─────────────────────────────────────────────
function isMarketHours() {
  const now = new Date();
  const nstOffset = 5 * 60 + 45;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const nstMinutes = (utcMinutes + nstOffset) % (24 * 60);
  const nstHour = Math.floor(nstMinutes / 60);
  const nstMin  = nstMinutes % 60;
  const nstDay  = now.getUTCDay(); // 0=Sun

  const isWeekday   = nstDay >= 0 && nstDay <= 4;
  const afterOpen   = nstHour > 11 || (nstHour === 11 && nstMin >= 0);
  const beforeClose = nstHour < 15;
  return isWeekday && afterOpen && beforeClose;
}

// ─── Scheduler ────────────────────────────────────────────────────────────
function startScheduler() {
  console.log('[Scheduler] Starting NEPSE cron jobs…');

  // Morning open: 11:05 NST = 05:20 UTC (Sun-Thu)
  cron.schedule('20 5 * * 0-4', () => runFetch('morning'),  { timezone: 'UTC' });

  // Midday: 13:00 NST = 07:15 UTC (Sun-Thu)
  cron.schedule('15 7 * * 0-4', () => runFetch('midday'),   { timezone: 'UTC' });

  // Closing: 15:05 NST = 09:20 UTC (Sun-Thu)
  cron.schedule('20 9 * * 0-4', async () => {
    await runFetch('closing');
    await runFloorsheetFetch(); // grab full floorsheet after close
  }, { timezone: 'UTC' });

  // Live every 5 min during market hours
  cron.schedule('*/5 5-9 * * 0-4', async () => {
    if (isMarketHours()) await runFetch('live');
  }, { timezone: 'UTC' });

  // Master data (companies + brokers) – nightly at 21:00 NST = 15:15 UTC
  cron.schedule('15 15 * * 0-4', runMasterDataFetch, { timezone: 'UTC' });

  // Warm up on startup
  runFetch('startup');
  runMasterDataFetch(); // sync company/broker list on startup

  console.log('[Scheduler] Cron jobs registered');
}

// ─── Cache + DB fallback ───────────────────────────────────────────────────
async function getCachedMarketData() {
  const { NepseSnapshot } = require('../models');
  const cached = await cache.getJSON(CACHE_KEY);
  if (cached) return cached;

  const snapshot = await NepseSnapshot.findOne({ order: [['createdAt', 'DESC']] });
  if (snapshot?.payload) {
    await cache.setJSON(CACHE_KEY, snapshot.payload, CACHE_TTL.afterHours);
    return snapshot.payload;
  }

  return runFetch('manual');
}

module.exports = { startScheduler, runFetch, getCachedMarketData, isMarketHours };