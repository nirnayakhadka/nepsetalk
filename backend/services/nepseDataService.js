/**
 * services/nepseDataService.js
 *
 * Aggregates NEPSE data from ALL available free sources:
 *
 * SOURCE 1 – nepalstock.com.np  (official, token-auth deciphered)
 *   • market-open status
 *   • today prices (all scrips)
 *   • market summary / indices
 *   • top gainers / losers
 *   • sector-wise summary
 *   • floorsheet (live trades)
 *   • company list
 *   • broker list
 *   • IPO results
 *   • announcements/alerts
 *
 * SOURCE 2 – merolagani.com  (scrape JSON endpoints)
 *   • live market ticker
 *   • top gainers / losers
 *   • 52-week high/low
 *   • company fundamental data
 *
 * SOURCE 3 – sharesansar.com  (scrape JSON endpoints)
 *   • live market summary
 *   • news feed
 *   • IPO calendar
 *
 * SOURCE 4 – nepsealpha.com  (scrape JSON endpoints)
 *   • stock detail by symbol
 *   • sector PE ratios
 *   • dividend history
 *
 * SOURCE 5 – nepalipaisa.com  (scrape)
 *   • broker-wise turnover
 *   • company history
 *
 * All data is normalised into a unified schema and stored in MySQL via Sequelize.
 */

const axios = require("axios");
const cheerio = require("cheerio");

// ─── nepalstock.com.np auth token machinery ───────────────────────────────
// Reference: github.com/dahsameer/nepse-api-document
const NEPSE_BASE = "https://newweb.nepalstock.com.np";

// Static data arrays used for token obfuscation by NEPSE
const DATA_ARR = [
  9, 8, 4, 1, 2, 3, 2, 5, 8, 7, 9, 8, 0, 3, 1, 2, 2, 4, 3, 0, 1, 9, 5, 4, 6, 3,
  7, 2, 1, 6, 9, 8, 4, 1, 2, 2, 3, 3, 4, 4,
];
const DUMMY_DATA = [
  190, 189, 178, 172, 177, 169, 167, 160, 163, 176, 145, 153, 138, 149, 136,
  152, 140, 166, 188, 133, 132, 134, 135, 137, 139, 141, 142, 143, 144, 146,
  147, 148, 150, 151, 154, 155, 156, 157, 158, 159, 161, 162, 164, 165, 168,
  170, 171, 173, 174, 175, 179, 180, 181, 182, 183, 184, 185, 186, 187, 191,
];

function decode1(saltNum, data) {
  return (
    data[
      (Math.floor(saltNum / 10) % 10) +
        (saltNum - Math.floor(saltNum / 10) * 10) +
        (Math.floor(saltNum / 100) % 10)
    ] + 22
  );
}

function decode2(saltNum, data) {
  return (
    data[
      (Math.floor(saltNum / 10) % 10) +
        (Math.floor(saltNum / 100) % 10) +
        (saltNum - Math.floor(saltNum / 10) * 10)
    ] +
    (Math.floor(saltNum / 10) % 10) +
    (Math.floor(saltNum / 100) % 10) +
    22
  );
}

// Token cache: avoid re-authenticating every request
let _tokenCache = null;
let _tokenExpiry = 0;

async function getNepseToken() {
  if (_tokenCache && Date.now() < _tokenExpiry) return _tokenCache;

  const resp = await axios.get(`${NEPSE_BASE}/api/authenticate/prove`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; NepseBot/1.0)" },
    timeout: 10000,
  });

  const { accessToken, refreshToken, salt1, salt2 } = resp.data;

  const num1 = decode1(salt2, DATA_ARR);
  const num2 = decode2(salt2, DATA_ARR);
  const num3 = decode1(salt1, DATA_ARR);
  const num4 = decode2(salt1, DATA_ARR);

  const validAccessToken =
    accessToken.slice(0, num1) +
    accessToken.slice(num1 + 1, num2) +
    accessToken.slice(num2 + 1);

  const validRefreshToken =
    refreshToken.slice(0, num3) +
    refreshToken.slice(num3 + 1, num4) +
    refreshToken.slice(num4 + 1);

  // Tokens expire in ~60s per NEPSE; cache for 55s
  _tokenCache = {
    accessToken: validAccessToken,
    refreshToken: validRefreshToken,
  };
  _tokenExpiry = Date.now() + 55_000;
  return _tokenCache;
}

async function nepseGet(path, params = {}) {
  const { accessToken } = await getNepseToken();
  const url = `${NEPSE_BASE}/api/nots/${path}`;
  const resp = await axios.get(url, {
    headers: {
      Authorization: `Salter ${accessToken}`,
      "User-Agent": "Mozilla/5.0 (compatible; NepseBot/1.0)",
    },
    params,
    timeout: 15000,
  });
  return resp.data;
}

async function nepsePost(path, body = {}) {
  const { accessToken } = await getNepseToken();
  // NEPSE today-price uses an id derived from market-open id
  const url = `${NEPSE_BASE}/api/nots/${path}`;
  const resp = await axios.post(url, body, {
    headers: {
      Authorization: `Salter ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; NepseBot/1.0)",
    },
    timeout: 15000,
  });
  return resp.data;
}

// ─── NEPSE OFFICIAL ENDPOINTS ─────────────────────────────────────────────

async function fetchNepalstockMarketOpen() {
  const data = await nepseGet("nepse-data/market-open");
  return {
    source: "nepalstock",
    endpoint: "market-open",
    isOpen: data.isOpen !== "CLOSE",
    isOpenRaw: data.isOpen,
    asOf: data.asOf,
    dummyId: data.id,
  };
}

async function fetchNepalstockTodayPrice(dummyId) {
  // The POST body id is derived from market-open id + DUMMY_DATA obfuscation
  const bodyId = dummyId
    ? DUMMY_DATA[dummyId % DUMMY_DATA.length]
    : DUMMY_DATA[0];

  const data = await nepsePost("nepse-data/today-price", { id: bodyId });
  // Returns array of all scrips with LTP, %change, volume etc.
  if (!Array.isArray(data)) return [];
  return data.map((s) => ({
    symbol: s.symbol,
    ltp: s.lastTradedPrice,
    openPrice: s.openPrice,
    highPrice: s.highPrice,
    lowPrice: s.lowPrice,
    prevClose: s.previousClose,
    change: s.change,
    percentChange: s.percentageChange,
    volume: s.totalTradedQuantity,
    turnover: s.totalTradedValue,
    transactions: s.totalTrades,
    week52High: s.fiftyTwoWeekHigh,
    week52Low: s.fiftyTwoWeekLow,
    source: "nepalstock",
  }));
}

async function fetchNepalstockMarketSummary() {
  const data = await nepseGet("nepse-data/nepse-price");
  return {
    source: "nepalstock",
    endpoint: "nepse-price",
    data,
  };
}

async function fetchNepalstockIndices() {
  const data = await nepseGet("nepse-data/index");
  return {
    source: "nepalstock",
    endpoint: "indices",
    indices: Array.isArray(data) ? data : [data],
  };
}

async function fetchNepalstockTopGainers() {
  const data = await nepseGet("nepse-data/top-ten-turnover-scrips");
  return { source: "nepalstock", endpoint: "top-gainers", data };
}

async function fetchNepalstockSectorSummary() {
  const data = await nepseGet("nepse-data/index-ceil-floor");
  return { source: "nepalstock", endpoint: "sector-summary", data };
}

async function fetchNepalstockCompanyList() {
  const data = await nepseGet("security/listed-securities");
  return { source: "nepalstock", endpoint: "company-list", data };
}

async function fetchNepalstockBrokers() {
  const data = await nepseGet("member");
  return { source: "nepalstock", endpoint: "brokers", data };
}

async function fetchNepalstockAlerts() {
  const data = await nepseGet("newsBulletin");
  return { source: "nepalstock", endpoint: "alerts", data };
}

async function fetchNepalstockFloorsheet(page = 0, size = 500) {
  const data = await nepseGet("nepse-data/floorsheet", {
    page,
    size,
    businessDate: "",
  });
  return { source: "nepalstock", endpoint: "floorsheet", data };
}

async function fetchNepalstockIPOResult(scrip, boid) {
  const data = await nepseGet(`ipo-result/${scrip}/${boid}`);
  return { source: "nepalstock", endpoint: "ipo-result", scrip, boid, data };
}

// ─── MEROLAGANI SCRAPERS ──────────────────────────────────────────────────
const ML_BASE = "https://merolagani.com";

async function fetchMerolaganiLatestMarket() {
  // Merolagani exposes a live market endpoint used by their ticker
  const resp = await axios.get(
    `${ML_BASE}/handlers/webrpc.ashx?type=market_summary`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `${ML_BASE}/LatestMarket.aspx`,
      },
      timeout: 12000,
    },
  );
  return {
    source: "merolagani",
    endpoint: "market-summary",
    data: resp.data,
  };
}

async function fetchMerolaganiLiveData() {
  const resp = await axios.get(
    `${ML_BASE}/handlers/webrpc.ashx?type=live_market`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `${ML_BASE}/LatestMarket.aspx`,
      },
      timeout: 12000,
    },
  );
  return { source: "merolagani", endpoint: "live-market", data: resp.data };
}

async function fetchMerolaganiTopTen(type = "gainers") {
  // type: gainers | losers | turnover | volume | transactions
  const resp = await axios.get(
    `${ML_BASE}/handlers/webrpc.ashx?type=top_ten_${type}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `${ML_BASE}/LatestMarket.aspx`,
      },
      timeout: 10000,
    },
  );
  return { source: "merolagani", endpoint: `top-ten-${type}`, data: resp.data };
}

async function fetchMerolaganiCompanyDetail(symbol) {
  const resp = await axios.get(
    `${ML_BASE}/handlers/webrpc.ashx?type=company_detail&symbol=${symbol}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `${ML_BASE}/`,
      },
      timeout: 10000,
    },
  );
  return {
    source: "merolagani",
    endpoint: "company-detail",
    symbol,
    data: resp.data,
  };
}

async function fetchMerolaganiIndices() {
  const resp = await axios.get(
    `${ML_BASE}/handlers/webrpc.ashx?type=market_indices`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `${ML_BASE}/LatestMarket.aspx`,
      },
      timeout: 10000,
    },
  );
  return { source: "merolagani", endpoint: "market-indices", data: resp.data };
}

// ─── SHARESANSAR SCRAPERS ─────────────────────────────────────────────────
const SS_BASE = "https://www.sharesansar.com";

async function fetchSharesansarLiveTrading() {
  const resp = await axios.get(`${SS_BASE}/live-trading`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 12000,
  });
  const $ = cheerio.load(resp.data);
  const rows = [];
  $("table#headFixed tbody tr").each((_, row) => {
    const cells = $(row)
      .find("td")
      .map((__, td) => $(td).text().trim())
      .get();
    if (cells.length >= 10) {
      rows.push({
        sn: cells[0],
        symbol: cells[1],
        name: cells[2],
        ltp: parseFloat(cells[3].replace(/,/g, "")) || null,
        change: parseFloat(cells[4].replace(/,/g, "")) || null,
        percentChange: parseFloat(cells[5].replace(/,/g, "")) || null,
        open: parseFloat(cells[6].replace(/,/g, "")) || null,
        high: parseFloat(cells[7].replace(/,/g, "")) || null,
        low: parseFloat(cells[8].replace(/,/g, "")) || null,
        volume: parseFloat(cells[9].replace(/,/g, "")) || null,
        prevClose: cells[10] ? parseFloat(cells[10].replace(/,/g, "")) : null,
      });
    }
  });
  return { source: "sharesansar", endpoint: "live-trading", data: rows };
}

async function fetchSharesansarMarketSummary() {
  const resp = await axios.get(`${SS_BASE}/today-share-price`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 12000,
  });
  const $ = cheerio.load(resp.data);
  const summary = {};
  // Grab market summary widget
  $(".featured-stat-wrap .stat-value").each((i, el) => {
    const val = $(el).text().trim();
    const label = $(el).prev(".stat-label").text().trim();
    if (label) summary[label] = val;
  });
  return { source: "sharesansar", endpoint: "market-summary", data: summary };
}

async function fetchSharesansarNews() {
  const resp = await axios.get(`${SS_BASE}/category/market-news`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 12000,
  });
  const $ = cheerio.load(resp.data);
  const news = [];
  $(".featured-news-list .news-list").each((_, el) => {
    news.push({
      title: $(el).find("h4").text().trim(),
      url: $(el).find("a").attr("href"),
      date: $(el).find(".news-date").text().trim(),
    });
  });
  return { source: "sharesansar", endpoint: "news", data: news };
}

async function fetchSharesansarIPOCalendar() {
  const resp = await axios.get(`${SS_BASE}/ipo`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 12000,
  });
  const $ = cheerio.load(resp.data);
  const ipos = [];
  $("table.table tbody tr").each((_, row) => {
    const cells = $(row)
      .find("td")
      .map((__, td) => $(td).text().trim())
      .get();
    if (cells.length >= 5) {
      ipos.push({
        company: cells[0],
        type: cells[1],
        units: cells[2],
        openDate: cells[3],
        closeDate: cells[4],
        pricePerUnit: cells[5] || null,
      });
    }
  });
  return { source: "sharesansar", endpoint: "ipo-calendar", data: ipos };
}

// ─── NEPSEALPHA SCRAPERS ──────────────────────────────────────────────────
const NA_BASE = "https://nepsealpha.com";

async function fetchNepsealphaStockInfo(symbol) {
  const resp = await axios.get(`${NA_BASE}/nepse-data?symbol=${symbol}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    timeout: 12000,
  });
  return {
    source: "nepsealpha",
    endpoint: "stock-info",
    symbol,
    data: resp.data,
  };
}

async function fetchNepsealphaMarketSummary() {
  const resp = await axios.get(`${NA_BASE}/live`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 12000,
  });
  const $ = cheerio.load(resp.data);
  const summary = {
    index: $(".nepse-index .value").first().text().trim(),
    change: $(".nepse-index .change").first().text().trim(),
    turnover: $(".market-turnover").first().text().trim(),
  };
  return { source: "nepsealpha", endpoint: "market-summary", data: summary };
}

async function fetchNepsealphaSectorPE() {
  const resp = await axios.get(`${NA_BASE}/trading/sector-pe`, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    timeout: 12000,
  });
  return { source: "nepsealpha", endpoint: "sector-pe", data: resp.data };
}

// ─── NEPALIPAISA SCRAPERS ─────────────────────────────────────────────────
const NP_BASE = "https://www.nepalipaisa.com";

async function fetchNepaliPaisaMarketSummary() {
  const resp = await axios.get(`${NP_BASE}/Modules/GetMarketSummary.aspx`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 10000,
  });
  return { source: "nepalipaisa", endpoint: "market-summary", data: resp.data };
}

async function fetchNepaliPaisaCompany(symbol) {
  const resp = await axios.get(
    `${NP_BASE}/Modules/StockDetails.aspx?StockSymbol=${symbol}`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    },
  );
  const $ = cheerio.load(resp.data);
  const detail = {};
  $("table.stockdetailtable tr").each((_, row) => {
    const label = $(row).find("td").first().text().trim();
    const value = $(row).find("td").last().text().trim();
    if (label && value && label !== value) detail[label] = value;
  });
  return {
    source: "nepalipaisa",
    endpoint: "company-detail",
    symbol,
    data: detail,
  };
}

// ─── KITTA.DEV (Community API – free & stable) ───────────────────────────
const KITTA_BASE = "https://nepalstock.com.np/api";

async function fetchKittaMarketSummary() {
  const resp = await axios.get(`${KITTA_BASE}/web/menu/`, {
    headers: { "User-Agent": "NepseBot/1.0" },
    timeout: 10000,
  });
  return { source: "kitta", endpoint: "market-summary", data: resp.data };
}

async function fetchKittaLivePrices() {
  const resp = await axios.get(`${KITTA_BASE}/market/live`, {
    headers: { "User-Agent": "NepseBot/1.0" },
    timeout: 10000,
  });
  return { source: "kitta", endpoint: "live-prices", data: resp.data };
}

async function fetchKittaStockDetail(symbol) {
  const resp = await axios.get(
    `${KITTA_BASE}/nots/securityDailyTradeStat/58${symbol}`,
    {
      headers: { "User-Agent": "NepseBot/1.0" },
      timeout: 10000,
    },
  );
  return { source: "kitta", endpoint: "stock-detail", symbol, data: resp.data };
}

async function fetchKittaBrokers() {
  const resp = await axios.get(`${KITTA_BASE}/brokers`, {
    headers: { "User-Agent": "NepseBot/1.0" },
    timeout: 10000,
  });
  return { source: "kitta", endpoint: "brokers", data: resp.data };
}

// ─── Safe wrapper ─────────────────────────────────────────────────────────
async function safeCall(name, fn) {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[NepseData] ⚠️  ${name} failed: ${err.message}`);
    return { source: name, error: err.message };
  }
}

// ─── Main aggregate fetch ─────────────────────────────────────────────────
/**
 * Fetches ALL sources in parallel, returning a unified payload.
 * Also returns the raw per-source results for DB storage.
 */
async function fetchAllNepseData() {
  // Step 1: get market-open status (needed for today-price body id)
  let marketOpen = null;
  try {
    marketOpen = await fetchNepalstockMarketOpen();
  } catch (e) {
    console.warn("[NepseData] market-open failed:", e.message);
  }

  const dummyId = marketOpen?.dummyId ?? 0;

  // Step 2: fire everything in parallel
  const [
    todayPrices,
    marketSummary,
    indices,
    topGainers,
    sectorSummary,
    alerts,

    mlSummary,
    mlLive,
    mlGainers,
    mlLosers,
    mlTurnover,
    mlVolume,
    mlIndices,

    ssTrade,
    ssNews,
    ssIPO,

    naMarket,
    naSectorPE,

    npMarket,

    kittaSummary,
    kittaLive,
    kittaBrokers,
  ] = await Promise.allSettled([
    safeCall("nepalstock/today-price", () =>
      fetchNepalstockTodayPrice(dummyId),
    ),
    safeCall("nepalstock/market-summary", fetchNepalstockMarketSummary),
    safeCall("nepalstock/indices", fetchNepalstockIndices),
    safeCall("nepalstock/top-gainers", fetchNepalstockTopGainers),
    safeCall("nepalstock/sector", fetchNepalstockSectorSummary),
    safeCall("nepalstock/alerts", fetchNepalstockAlerts),

    safeCall("merolagani/market-summary", fetchMerolaganiLatestMarket),
    safeCall("merolagani/live", fetchMerolaganiLiveData),
    safeCall("merolagani/gainers", () => fetchMerolaganiTopTen("gainers")),
    safeCall("merolagani/losers", () => fetchMerolaganiTopTen("losers")),
    safeCall("merolagani/turnover", () => fetchMerolaganiTopTen("turnover")),
    safeCall("merolagani/volume", () => fetchMerolaganiTopTen("volume")),
    safeCall("merolagani/indices", fetchMerolaganiIndices),

    safeCall("sharesansar/live-trading", fetchSharesansarLiveTrading),
    safeCall("sharesansar/news", fetchSharesansarNews),
    safeCall("sharesansar/ipo", fetchSharesansarIPOCalendar),

    safeCall("nepsealpha/market", fetchNepsealphaMarketSummary),
    safeCall("nepsealpha/sector-pe", fetchNepsealphaSectorPE),

    safeCall("nepalipaisa/market", fetchNepaliPaisaMarketSummary),

    safeCall("kitta/summary", fetchKittaMarketSummary),
    safeCall("kitta/live", fetchKittaLivePrices),
    safeCall("kitta/brokers", fetchKittaBrokers),
  ]);

  // Extract settled values
  const resolved = (p) =>
    p.status === "fulfilled" ? p.value : { error: p.reason?.message };

  return {
    fetchedAt: new Date().toISOString(),
    isMarketOpen: marketOpen?.isOpen ?? false,
    marketOpenAsOf: marketOpen?.asOf,
    sources: {
      nepalstock: {
        marketOpen,
        todayPrices: resolved(todayPrices),
        marketSummary: resolved(marketSummary),
        indices: resolved(indices),
        topGainers: resolved(topGainers),
        sectorSummary: resolved(sectorSummary),
        alerts: resolved(alerts),
      },
      merolagani: {
        summary: resolved(mlSummary),
        live: resolved(mlLive),
        gainers: resolved(mlGainers),
        losers: resolved(mlLosers),
        turnover: resolved(mlTurnover),
        volume: resolved(mlVolume),
        indices: resolved(mlIndices),
      },
      sharesansar: {
        liveTrading: resolved(ssTrade),
        news: resolved(ssNews),
        ipo: resolved(ssIPO),
      },
      nepsealpha: {
        market: resolved(naMarket),
        sectorPE: resolved(naSectorPE),
      },
      nepalipaisa: {
        market: resolved(npMarket),
      },
      kitta: {
        summary: resolved(kittaSummary),
        live: resolved(kittaLive),
        brokers: resolved(kittaBrokers),
      },
    },
  };
}

// ─── Kept backward-compat with existing nepseScheduler.js ─────────────────
async function fetchLiveData() {
  const all = await fetchAllNepseData();

  // Flatten to the shape your existing code expects
  const nepalstockPrices = all.sources.nepalstock.todayPrices;
  const prices = Array.isArray(nepalstockPrices) ? nepalstockPrices : [];

  // Build a market index value from indices
  const idx = all.sources.nepalstock.indices?.indices?.[0];

  // Use sharesansar live trading as fallback for prices
  const ssTradeData = all.sources.sharesansar.liveTrading?.data ?? [];
  const allPrices = prices.length > 0 ? prices : ssTradeData;

  // Build gainers, losers, and turnoverLeaders from sharesansar data
  const ssGainers = [...ssTradeData]
    .filter((s) => s.percentChange > 0)
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, 10);

  const ssLosers = [...ssTradeData]
    .filter((s) => s.percentChange < 0)
    .sort((a, b) => a.percentChange - b.percentChange)
    .slice(0, 10);

  const turnoverLeaders = [...ssTradeData]
    .filter((s) => s.volume > 0)
    .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
    .slice(0, 10);

  return {
    fetchedAt: all.fetchedAt,
    isMarketOpen: all.isMarketOpen,
    marketIndex: {
      value: idx?.index ?? null,
      change: idx?.change ?? null,
      percentChange: idx?.percentChange ?? null,
    },
    summary: all.sources.nepalstock.marketSummary?.data ?? {},
    prices: allPrices,
    gainers,
    losers: ssLosers,
    turnoverLeaders,
    totalTurnover: {
      value:
        ssTradeData.length > 0
          ? (
              ssTradeData.reduce((sum, s) => sum + (s.volume ?? 0), 0) / 1e7
            ).toFixed(2)
          : null,
      unit: "करोड",
    },
    activeStocks: {
      value: ssTradeData.length,
      gainers: ssTradeData.filter((s) => (s.change ?? 0) > 0).length,
      losers: ssTradeData.filter((s) => (s.change ?? 0) < 0).length,
    },
    source: "sharesansar",
    sectorSummary: all.sources.nepalstock.sectorSummary?.data ?? [],
    alerts: all.sources.nepalstock.alerts?.data ?? [],
    merolaganiLive: all.sources.merolagani.live?.data ?? null,
    sharesansarNews: all.sources.sharesansar.news?.data ?? [],
    ipoCalendar: all.sources.sharesansar.ipo?.data ?? [],
    sectorPE: all.sources.nepsealpha.sectorPE?.data ?? [],
    _raw: all,
  };
}

module.exports = {
  // Main entry points
  fetchLiveData, // backward-compat with scheduler
  fetchAllNepseData, // full aggregate

  // Individual source fetchers (for targeted cron jobs)
  fetchNepalstockMarketOpen,
  fetchNepalstockTodayPrice,
  fetchNepalstockMarketSummary,
  fetchNepalstockIndices,
  fetchNepalstockTopGainers,
  fetchNepalstockSectorSummary,
  fetchNepalstockCompanyList,
  fetchNepalstockBrokers,
  fetchNepalstockAlerts,
  fetchNepalstockFloorsheet,
  fetchNepalstockIPOResult,

  fetchMerolaganiLatestMarket,
  fetchMerolaganiLiveData,
  fetchMerolaganiTopTen,
  fetchMerolaganiCompanyDetail,
  fetchMerolaganiIndices,

  fetchSharesansarLiveTrading,
  fetchSharesansarMarketSummary,
  fetchSharesansarNews,
  fetchSharesansarIPOCalendar,

  fetchNepsealphaStockInfo,
  fetchNepsealphaMarketSummary,
  fetchNepsealphaSectorPE,

  fetchNepaliPaisaMarketSummary,
  fetchNepaliPaisaCompany,

  fetchKittaMarketSummary,
  fetchKittaLivePrices,
  fetchKittaStockDetail,
  fetchKittaBrokers,
};
