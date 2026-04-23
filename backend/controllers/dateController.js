const { bsToAd, adToBs, getToday, getDaysInBsMonth } = require('../utils/dateConverter');

/**
 * POST /api/date/bs-to-ad
 * Body: { year: 2081, month: 6, day: 15 }
 */
const convertBsToAd = (req, res) => {
  try {
    const { year, month, day } = req.body;

    if (!year || !month || !day) {
      return res.status(400).json({ success: false, error: 'year, month, and day are required' });
    }

    const result = bsToAd(Number(year), Number(month), Number(day));

    return res.json({
      success: true,
      input:  { year, month, day, calendar: 'BS' },
      output: { ...result, calendar: 'AD' },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/date/ad-to-bs
 * Body: { year: 2024, month: 10, day: 1 }
 */
const convertAdToBs = (req, res) => {
  try {
    const { year, month, day } = req.body;

    if (!year || !month || !day) {
      return res.status(400).json({ success: false, error: 'year, month, and day are required' });
    }

    const result = adToBs(Number(year), Number(month), Number(day));

    return res.json({
      success: true,
      input:  { year, month, day, calendar: 'AD' },
      output: { ...result, calendar: 'BS' },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/date/today
 * Returns today in both BS and AD
 */
const getTodayDate = (req, res) => {
  try {
    const result = getToday();
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/date/bs-month-days?year=2081&month=6
 * Returns how many days are in a given BS month
 */
const getBsMonthDays = (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, error: 'year and month query params are required' });
    }
    const days = getDaysInBsMonth(Number(year), Number(month));
    return res.json({ success: true, year: Number(year), month: Number(month), days });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { convertBsToAd, convertAdToBs, getTodayDate, getBsMonthDays };