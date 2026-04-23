/**
 * services/nepseSaveService.js
 *
 * Handles all DB writes after a fetch.  Every table uses upsert / bulkCreate
 * with ignoreDuplicates so re-running is safe.
 *
 * Call saveSnapshot(payload) after fetchLiveData() or fetchAllNepseData().
 */

const {
  NepseSnapshot,
  NepsePrice,
  NepseIndex,
  NepseTopMover,
  NepseSector,
  NepseFloorsheet,
  NepseCompany,
  NepseBroker,
  NepseAlert,
  NepseIPO,
  NepseSectorPE,
} = require('../models/nepse');

// Helpers
const today = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ─── 1. Raw snapshot ──────────────────────────────────────────────────────
async function saveRawSnapshot(payload) {
  return NepseSnapshot.create({
    fetchSchedule:    payload.fetchSchedule || 'manual',
    isMarketOpen:     payload.isMarketOpen ?? false,
    marketIndexValue: payload.marketIndex?.value ?? null,
    payload:          payload._raw ?? payload,
    fetchedAt:        payload.fetchedAt ?? new Date(),
  });
}

// ─── 2. Today prices (upsert per symbol per day) ──────────────────────────
async function savePrices(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return;
  const date = today();
  const rows = prices
    .filter((p) => p.symbol)
    .map((p) => ({
      symbol:        p.symbol,
      tradeDate:     date,
      ltp:           p.ltp ?? null,
      openPrice:     p.openPrice ?? null,
      highPrice:     p.highPrice ?? null,
      lowPrice:      p.lowPrice ?? null,
      prevClose:     p.prevClose ?? null,
      change:        p.change ?? null,
      percentChange: p.percentChange ?? null,
      volume:        p.volume ?? null,
      turnover:      p.turnover ?? null,
      transactions:  p.transactions ?? null,
      week52High:    p.week52High ?? null,
      week52Low:     p.week52Low ?? null,
      source:        p.source ?? 'nepalstock',
      fetchedAt:     new Date(),
    }));

  // Upsert: update all price columns on conflict (symbol + tradeDate)
  await NepsePrice.bulkCreate(rows, {
    updateOnDuplicate: [
      'ltp','openPrice','highPrice','lowPrice','prevClose',
      'change','percentChange','volume','turnover','transactions',
      'week52High','week52Low','source','fetchedAt',
    ],
  });
  console.log(`[DB] ✅ Saved/updated ${rows.length} prices`);
}

// ─── 3. Indices ───────────────────────────────────────────────────────────
async function saveIndices(indicesPayload) {
  const arr = indicesPayload?.indices;
  if (!Array.isArray(arr) || arr.length === 0) return;
  const date = today();
  const rows = arr.map((idx) => ({
    indexName:    idx.indexName ?? idx.name ?? 'NEPSE',
    tradeDate:    date,
    indexValue:   idx.index ?? idx.indexValue ?? idx.value ?? null,
    change:       idx.change ?? null,
    percentChange:idx.percentChange ?? idx.pChange ?? null,
    turnover:     idx.turnover ?? null,
    source:       'nepalstock',
    fetchedAt:    new Date(),
  }));

  await NepseIndex.bulkCreate(rows, {
    updateOnDuplicate: ['indexValue','change','percentChange','turnover','source','fetchedAt'],
  });
  console.log(`[DB] ✅ Saved/updated ${rows.length} indices`);
}

// ─── 4. Top movers ────────────────────────────────────────────────────────
async function saveTopMovers(gainersPayload) {
  const data = gainersPayload?.data;
  if (!data) return;
  const date = today();

  const categories = {
    gainer:      data.gainers  ?? data.topGainers  ?? [],
    loser:       data.losers   ?? data.topLosers   ?? [],
    turnover:    data.turnovers ?? data.topTurnover ?? [],
    volume:      data.volumes  ?? data.topVolume   ?? [],
    transactions:data.transactions ?? [],
  };

  const rows = [];
  for (const [cat, items] of Object.entries(categories)) {
    if (!Array.isArray(items)) continue;
    items.forEach((item, i) => {
      if (!item?.symbol) return;
      rows.push({
        tradeDate:     date,
        category:      cat,
        rank:          i + 1,
        symbol:        item.symbol,
        ltp:           item.ltp ?? item.lastTradedPrice ?? null,
        change:        item.change ?? null,
        percentChange: item.percentChange ?? item.pChange ?? null,
        turnover:      item.turnover ?? null,
        volume:        item.volume ?? item.totalTradedQuantity ?? null,
        source:        gainersPayload?.source ?? 'nepalstock',
        fetchedAt:     new Date(),
      });
    });
  }

  if (rows.length === 0) return;
  await NepseTopMover.bulkCreate(rows, { ignoreDuplicates: true });
  console.log(`[DB] ✅ Saved ${rows.length} top mover records`);
}

// ─── 5. Sector summary ────────────────────────────────────────────────────
async function saveSectorSummary(sectorPayload) {
  const arr = sectorPayload?.data;
  if (!Array.isArray(arr) || arr.length === 0) return;
  const date = today();
  const rows = arr.map((s) => ({
    tradeDate:     date,
    sectorName:    s.sectorName ?? s.name ?? 'Unknown',
    indexValue:    s.index ?? s.indexValue ?? null,
    change:        s.change ?? null,
    percentChange: s.percentChange ?? null,
    turnover:      s.turnover ?? null,
    source:        'nepalstock',
    fetchedAt:     new Date(),
  }));

  await NepseSector.bulkCreate(rows, {
    updateOnDuplicate: ['indexValue','change','percentChange','turnover','source','fetchedAt'],
  });
  console.log(`[DB] ✅ Saved ${rows.length} sector records`);
}

// ─── 6. Floorsheet ────────────────────────────────────────────────────────
async function saveFloorsheet(floorPayload) {
  const data = floorPayload?.data;
  const items = data?.floorsheets?.content ?? data?.content ?? [];
  if (!Array.isArray(items) || items.length === 0) return;
  const date = today();

  const rows = items.map((f) => ({
    tradeDate:    date,
    contractNo:   String(f.contractId ?? f.contractNo ?? ''),
    symbol:       f.stockSymbol ?? f.symbol ?? '',
    buyerBroker:  parseInt(f.buyerMemberId  ?? f.buyerBroker)  || null,
    sellerBroker: parseInt(f.sellerMemberId ?? f.sellerBroker) || null,
    quantity:     parseInt(f.contractQuantity ?? f.quantity)   || null,
    rate:         parseFloat(f.contractRate  ?? f.rate)        || null,
    amount:       parseFloat(f.contractAmount ?? f.amount)     || null,
    fetchedAt:    new Date(),
  }));

  await NepseFloorsheet.bulkCreate(rows, { ignoreDuplicates: true });
  console.log(`[DB] ✅ Saved ${rows.length} floorsheet records`);
}

// ─── 7. Company list ──────────────────────────────────────────────────────
async function saveCompanies(companiesPayload) {
  const arr = companiesPayload?.data;
  if (!Array.isArray(arr) || arr.length === 0) return;
  const rows = arr.map((c) => ({
    symbol:       c.symbol,
    name:         c.companyName ?? c.name ?? c.symbol,
    sector:       c.sectorName ?? c.sector ?? null,
    listedShares: c.listedShares ?? null,
    paidUpValue:  c.paidUpValue ?? null,
    totalPaidUp:  c.totalPaidUpValue ?? null,
    isin:         c.isin ?? null,
    source:       'nepalstock',
    updatedAt:    new Date(),
  }));

  await NepseCompany.bulkCreate(rows, {
    updateOnDuplicate: ['name','sector','listedShares','paidUpValue','totalPaidUp','isin','updatedAt'],
  });
  console.log(`[DB] ✅ Saved/updated ${rows.length} companies`);
}

// ─── 8. Brokers ───────────────────────────────────────────────────────────
async function saveBrokers(brokersPayload) {
  const arr = brokersPayload?.data;
  if (!Array.isArray(arr) || arr.length === 0) return;
  const rows = arr.map((b) => ({
    brokerNo: parseInt(b.memberCode ?? b.brokerNo) || null,
    name:     b.memberName ?? b.name ?? '',
    contact:  b.contactNo ?? null,
    email:    b.email ?? null,
    address:  b.address ?? null,
    source:   'nepalstock',
    updatedAt:new Date(),
  })).filter((r) => r.brokerNo);

  await NepseBroker.bulkCreate(rows, {
    updateOnDuplicate: ['name','contact','email','address','updatedAt'],
  });
  console.log(`[DB] ✅ Saved/updated ${rows.length} brokers`);
}

// ─── 9. Alerts ────────────────────────────────────────────────────────────
async function saveAlerts(alertsPayload) {
  const arr = alertsPayload?.data;
  if (!Array.isArray(arr) || arr.length === 0) return;
  const rows = arr.map((a) => ({
    externalId:  String(a.id ?? a.externalId ?? ''),
    title:       a.title ?? a.description ?? '',
    description: a.body ?? a.fullDescription ?? null,
    publishedAt: a.publishedDate ? new Date(a.publishedDate) : null,
    url:         a.url ?? null,
    source:      alertsPayload?.source ?? 'nepalstock',
    fetchedAt:   new Date(),
  }));

  await NepseAlert.bulkCreate(rows, { ignoreDuplicates: true });
  console.log(`[DB] ✅ Saved ${rows.length} alerts`);
}

// ─── 10. IPO calendar ─────────────────────────────────────────────────────
async function saveIPOCalendar(ipoPayload) {
  const arr = ipoPayload?.data;
  if (!Array.isArray(arr) || arr.length === 0) return;
  const rows = arr.map((ipo) => ({
    company:      ipo.company ?? ipo.companyName ?? '',
    symbol:       ipo.symbol ?? null,
    type:         ipo.type ?? ipo.shareType ?? null,
    units:        ipo.units ?? null,
    openDate:     ipo.openDate ?? null,
    closeDate:    ipo.closeDate ?? null,
    pricePerUnit: parseFloat(ipo.pricePerUnit ?? ipo.price) || null,
    status:       ipo.status ?? 'upcoming',
    source:       ipoPayload?.source ?? 'sharesansar',
    fetchedAt:    new Date(),
  }));

  await NepseIPO.bulkCreate(rows, { ignoreDuplicates: true });
  console.log(`[DB] ✅ Saved ${rows.length} IPO records`);
}

// ─── 11. Sector PE ────────────────────────────────────────────────────────
async function saveSectorPE(sectorPEPayload) {
  const arr = sectorPEPayload?.data;
  if (!Array.isArray(arr) || arr.length === 0) return;
  const date = today();
  const rows = arr.map((s) => ({
    tradeDate:  date,
    sectorName: s.sectorName ?? s.sector ?? '',
    pe:         parseFloat(s.pe ?? s.peRatio) || null,
    pb:         parseFloat(s.pb ?? s.pbRatio) || null,
    roe:        parseFloat(s.roe) || null,
    source:     'nepsealpha',
    fetchedAt:  new Date(),
  }));

  await NepseSectorPE.bulkCreate(rows, {
    updateOnDuplicate: ['pe','pb','roe','source','fetchedAt'],
  });
  console.log(`[DB] ✅ Saved ${rows.length} sector PE records`);
}

// ─── Master save function ─────────────────────────────────────────────────
/**
 * saveSnapshot(payload)
 *
 * payload is the output from fetchLiveData() or fetchAllNepseData().
 * Saves everything to MySQL in parallel where possible.
 */
async function saveSnapshot(payload) {
  const raw = payload._raw ?? {};
  const ns  = raw.sources?.nepalstock  ?? {};
  const ml  = raw.sources?.merolagani  ?? {};
  const ss  = raw.sources?.sharesansar ?? {};
  const na  = raw.sources?.nepsealpha  ?? {};

  await Promise.allSettled([
    saveRawSnapshot(payload),
    savePrices(payload.prices ?? ns.todayPrices),
    saveIndices(ns.indices),
    saveTopMovers({
      source: 'nepalstock',
      data: {
        gainers:  ns.topGainers?.data ?? ml.gainers?.data,
        losers:   ml.losers?.data,
        turnovers:ml.turnover?.data,
        volumes:  ml.volume?.data,
      },
    }),
    saveSectorSummary(ns.sectorSummary),
    saveAlerts({ source: 'nepalstock', data: payload.alerts ?? ns.alerts?.data }),
    saveIPOCalendar(ss.ipo),
    saveSectorPE(na.sectorPE),
  ]);
}

module.exports = {
  saveSnapshot,
  saveRawSnapshot,
  savePrices,
  saveIndices,
  saveTopMovers,
  saveSectorSummary,
  saveFloorsheet,
  saveCompanies,
  saveBrokers,
  saveAlerts,
  saveIPOCalendar,
  saveSectorPE,
};