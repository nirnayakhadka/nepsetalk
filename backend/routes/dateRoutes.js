const express = require('express');
const router = express.Router();
const {
  convertBsToAd,
  convertAdToBs,
  getTodayDate,
  getBsMonthDays,
} = require('../controllers/dateController');

// GET  /api/date/today          → today in both BS and AD
// GET  /api/date/bs-month-days  → days in a BS month (?year=2081&month=6)
// POST /api/date/bs-to-ad       → convert BS → AD
// POST /api/date/ad-to-bs       → convert AD → BS

router.get('/today',          getTodayDate);
router.get('/bs-month-days',  getBsMonthDays);
router.post('/bs-to-ad',      convertBsToAd);
router.post('/ad-to-bs',      convertAdToBs);

module.exports = router;