/**
 * routes/nepse.js  (UPDATED)
 *
 * Public NEPSE REST API — all endpoints respond with JSON.
 *
 * GET  /api/nepse/market              – live market summary (cached)
 * GET  /api/nepse/market/status       – is market open?
 * GET  /api/nepse/market/indices      – NEPSE + sub-indices
 * GET  /api/nepse/market/summary      – turnover, volume, transactions
 *
 * GET  /api/nepse/stocks              – all scrip prices for today
 * GET  /api/nepse/stock?symbol=NABIL  – single stock detail (live + history)
 * GET  /api/nepse/stock/history?symbol=NABIL&days=30
 *
 * GET  /api/nepse/movers/gainers      – top gainers
 * GET  /api/nepse/movers/losers       – top losers
 * GET  /api/nepse/movers/turnover     – top by turnover
 * GET  /api/nepse/movers/volume       – top by volume
 *
 * GET  /api/nepse/sectors             – sector-wise index & turnover
 * GET  /api/nepse/sectors/pe          – sector PE ratios
 *
 * GET  /api/nepse/companies           – full company list
 * GET  /api/nepse/company?symbol=NABIL
 *
 * GET  /api/nepse/brokers             – broker list
 *
 * GET  /api/nepse/floorsheet?date=YYYY-MM-DD&page=0&size=200
 * GET  /api/nepse/floorsheet/live     – trigger fresh floorsheet fetch
 *
 * GET  /api/nepse/alerts              – NEPSE announcements
 * GET  /api/nepse/ipo                 – IPO calendar
 *
 * GET  /api/nepse/news                – news from sharesansar
 *
 * POST /api/nepse/ipo/check           – body: { scrip, boid } – IPO allotment check
 */

const express = require('express');
const router  = express.Router();
const { Op }  = require('sequelize');

const { getCachedMarketData, isMarketHours } = require('../jobs/nepseScheduler');
const {
  fetchMerolaganiCompanyDetail,
  fetchNepsealphaStockInfo,
  fetchNepaliPaisaCompany,
  fetchKittaStockDetail,
  fetchNepalstockIPOResult,
  fetchSharesansarNews,
} = require('../services/nepseDataService');
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

const { runFetch } = require('../jobs/nepseScheduler');

// ─── Helpers ───────────────────────────────────────────────────────────────
function ok(res, data)  { res.json({ success: true,  data }); }
function err(res, msg, status = 500) { res.status(status).json({ success: false, message: msg }); }

function today() { return new Date().toISOString().slice(0, 10); }

// ── Market ─────────────────────────────────────────────────────────────────

// GET /api/nepse/market
router.get('/market', async (req, res) => {
  try {
    const data = await getCachedMarketData();
    ok(res, data);
  } catch (e) { err(res, e.message); }
});

// GET /api/nepse/market/status
router.get('/market/status', (req, res) => {
  ok(res, {
    isMarketOpen: isMarketHours(),
    timestamp:    new Date().toISOString(),
  });
});

// GET /api/nepse/market/indices
router.get('/market/indices', async (req, res) => {
  try {
    const date = req.query.date ?? today();
    const rows = await NepseIndex.findAll({
      where: { tradeDate: date },
      order: [['indexName', 'ASC']],
    });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// GET /api/nepse/market/summary
router.get('/market/summary', async (req, res) => {
  try {
    const data = await getCachedMarketData();
    ok(res, data?.summary ?? {});
  } catch (e) { err(res, e.message); }
});

// ── Stocks ─────────────────────────────────────────────────────────────────

// GET /api/nepse/stocks  – today's prices for all scrips
router.get('/stocks', async (req, res) => {
  try {
    const date = req.query.date ?? today();
    const rows = await NepsePrice.findAll({
      where: { tradeDate: date },
      order: [['symbol', 'ASC']],
    });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// GET /api/nepse/stock?symbol=NABIL
// Returns today's OHLCV from DB + live enrichment from multiple sources
router.get('/stock', async (req, res) => {
  const symbol = (req.query.symbol || '').toUpperCase();
  if (!symbol) return err(res, 'symbol is required', 400);

  try {
    const date = today();

    // Local DB price row
    const dbPrice = await NepsePrice.findOne({
      where: { symbol, tradeDate: date },
    });

    // Enrich from multiple live sources (in parallel, fail-safe)
    const [ml, na, kitta] = await Promise.allSettled([
      fetchMerolaganiCompanyDetail(symbol),
      fetchNepsealphaStockInfo(symbol),
      fetchKittaStockDetail(symbol),
    ]);

    const extract = (p) => (p.status === 'fulfilled' ? p.value?.data : null);

    ok(res, {
      symbol,
      today:        dbPrice,
      merolagani:   extract(ml),
      nepsealpha:   extract(na),
      kitta:        extract(kitta),
      fetchedAt:    new Date().toISOString(),
    });
  } catch (e) { err(res, e.message); }
});

// GET /api/nepse/stock/history?symbol=NABIL&days=30
router.get('/stock/history', async (req, res) => {
  const symbol = (req.query.symbol || '').toUpperCase();
  const days   = Math.min(parseInt(req.query.days ?? 30), 365);
  if (!symbol) return err(res, 'symbol is required', 400);

  try {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await NepsePrice.findAll({
      where: {
        symbol,
        tradeDate: { [Op.gte]: from.toISOString().slice(0, 10) },
      },
      order: [['tradeDate', 'ASC']],
    });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// ── Movers ─────────────────────────────────────────────────────────────────

const moverCategories = ['gainer', 'loser', 'turnover', 'volume', 'transactions'];

router.get('/movers/:category', async (req, res) => {
  const cat = req.params.category.replace('s', ''); // gainers → gainer
  if (!moverCategories.includes(cat)) return err(res, 'Invalid category', 400);

  try {
    const date = req.query.date ?? today();
    const rows = await NepseTopMover.findAll({
      where:  { tradeDate: date, category: cat },
      order:  [['rank', 'ASC']],
      limit:  parseInt(req.query.limit ?? 25),
    });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// ── Sectors ────────────────────────────────────────────────────────────────

// GET /api/nepse/sectors
router.get('/sectors', async (req, res) => {
  try {
    const date = req.query.date ?? today();
    const rows = await NepseSector.findAll({
      where: { tradeDate: date },
      order: [['sectorName', 'ASC']],
    });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// GET /api/nepse/sectors/pe
router.get('/sectors/pe', async (req, res) => {
  try {
    const date = req.query.date ?? today();
    const rows = await NepseSectorPE.findAll({
      where: { tradeDate: date },
      order: [['sectorName', 'ASC']],
    });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// ── Companies ──────────────────────────────────────────────────────────────

// GET /api/nepse/companies
router.get('/companies', async (req, res) => {
  try {
    const where = {};
    if (req.query.sector) where.sector = req.query.sector;
    const rows = await NepseCompany.findAll({ where, order: [['symbol', 'ASC']] });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// GET /api/nepse/company?symbol=NABIL
router.get('/company', async (req, res) => {
  const symbol = (req.query.symbol || '').toUpperCase();
  if (!symbol) return err(res, 'symbol is required', 400);
  try {
    const company = await NepseCompany.findOne({ where: { symbol } });
    if (!company) return err(res, 'Company not found', 404);
    // Optionally enrich with nepalipaisa
    const npDetail = await fetchNepaliPaisaCompany(symbol).catch(() => null);
    ok(res, { ...company.toJSON(), nepalipaisa: npDetail?.data ?? null });
  } catch (e) { err(res, e.message); }
});

// ── Brokers ────────────────────────────────────────────────────────────────

// GET /api/nepse/brokers
router.get('/brokers', async (req, res) => {
  try {
    const rows = await NepseBroker.findAll({ order: [['brokerNo', 'ASC']] });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// ── Floorsheet ─────────────────────────────────────────────────────────────

// GET /api/nepse/floorsheet?date=YYYY-MM-DD&symbol=NABIL&page=0&size=200
router.get('/floorsheet', async (req, res) => {
  try {
    const date   = req.query.date ?? today();
    const size   = Math.min(parseInt(req.query.size ?? 200), 2000);
    const offset = parseInt(req.query.page ?? 0) * size;
    const where  = { tradeDate: date };
    if (req.query.symbol)       where.symbol       = req.query.symbol.toUpperCase();
    if (req.query.buyerBroker)  where.buyerBroker  = parseInt(req.query.buyerBroker);
    if (req.query.sellerBroker) where.sellerBroker = parseInt(req.query.sellerBroker);

    const { count, rows } = await NepseFloorsheet.findAndCountAll({
      where,
      order:  [['id', 'ASC']],
      limit:  size,
      offset,
    });
    ok(res, { total: count, page: parseInt(req.query.page ?? 0), size, data: rows });
  } catch (e) { err(res, e.message); }
});

// ── Alerts ─────────────────────────────────────────────────────────────────

// GET /api/nepse/alerts?limit=20
router.get('/alerts', async (req, res) => {
  try {
    const rows = await NepseAlert.findAll({
      order: [['publishedAt', 'DESC']],
      limit: Math.min(parseInt(req.query.limit ?? 20), 100),
    });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// ── IPO ────────────────────────────────────────────────────────────────────

// GET /api/nepse/ipo?status=upcoming
router.get('/ipo', async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const rows = await NepseIPO.findAll({
      where,
      order: [['openDate', 'DESC']],
      limit: parseInt(req.query.limit ?? 50),
    });
    ok(res, rows);
  } catch (e) { err(res, e.message); }
});

// POST /api/nepse/ipo/check  body: { scrip, boid }
router.post('/ipo/check', async (req, res) => {
  const { scrip, boid } = req.body;
  if (!scrip || !boid) return err(res, 'scrip and boid required', 400);
  try {
    const result = await fetchNepalstockIPOResult(scrip, boid);
    ok(res, result);
  } catch (e) { err(res, e.message); }
});

// ── News ───────────────────────────────────────────────────────────────────

// GET /api/nepse/news
router.get('/news', async (req, res) => {
  try {
    const result = await fetchSharesansarNews();
    ok(res, result.data);
  } catch (e) { err(res, e.message); }
});

// ── Manual refresh (admin use) ─────────────────────────────────────────────
// POST /api/nepse/refresh   (protect with admin auth in production)
router.post('/refresh', async (req, res) => {
  try {
    const data = await runFetch('manual-api');
    ok(res, { message: 'Refresh triggered', indexValue: data?.marketIndex?.value });
  } catch (e) { err(res, e.message); }
});


module.exports = router;