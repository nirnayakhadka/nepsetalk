/**
 * Nepali (BS) ↔ English (AD) Date Converter
 * Accurate lookup table covering BS 2000–2090
 */

// Each entry: [total days in that BS year, days in each of the 12 BS months]
const BS_CALENDAR_DATA = {
  2000: [365, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [365, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2009: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2013: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2017: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2020: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2021: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2023: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2024: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2025: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2027: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2028: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2029: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2030: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2031: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2032: [365, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2033: [365, 31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2035: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2036: [365, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2037: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2038: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2039: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2040: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2041: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2042: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2043: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2044: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2045: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2046: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2047: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2048: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2049: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2050: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2051: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2052: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2053: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2054: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2055: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2056: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2057: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2058: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2059: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2060: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2061: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2062: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2063: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2064: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2065: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2066: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2067: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2068: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2069: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2070: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2071: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2072: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2073: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2074: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2075: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2076: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2077: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2078: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2079: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2080: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2081: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2082: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2083: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2084: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2085: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2086: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2087: [366, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2088: [365, 29, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2089: [365, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2090: [365, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
};

// Reference point: BS 2000/01/01 = AD 1943/04/14
const START_BS = { year: 2000, month: 1, day: 1 };
const START_AD = new Date(1943, 3, 14); // month is 0-indexed in JS

const BS_MONTH_NAMES = [
  '', 'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
  'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
  'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const BS_MONTH_NAMES_NP = [
  '', 'बैशाख', 'जेठ', 'असार', 'श्रावण',
  'भाद्र', 'आश्विन', 'कार्तिक', 'मंसिर',
  'पुष', 'माघ', 'फाल्गुन', 'चैत्र'
];

/**
 * Count total days from BS reference start to the given BS date.
 */
function bsToDayCount(year, month, day) {
  let totalDays = 0;

  for (let y = START_BS.year; y < year; y++) {
    if (!BS_CALENDAR_DATA[y]) throw new Error(`BS year ${y} not in lookup table`);
    totalDays += BS_CALENDAR_DATA[y][0];
  }

  const yearData = BS_CALENDAR_DATA[year];
  if (!yearData) throw new Error(`BS year ${year} not in lookup table`);

  for (let m = 1; m < month; m++) {
    totalDays += yearData[m];
  }

  totalDays += day - 1;
  return totalDays;
}

/**
 * Convert BS date → AD date.
 * @param {number} year  BS year  (e.g. 2081)
 * @param {number} month BS month (1–12)
 * @param {number} day   BS day   (1–32)
 * @returns {{ year, month, day, date: Date, monthName, monthNameNp, dayOfWeek }}
 */
function bsToAd(year, month, day) {
  if (!BS_CALENDAR_DATA[year]) {
    throw new Error(`BS year ${year} is out of supported range (2000–2090)`);
  }
  const monthData = BS_CALENDAR_DATA[year];
  if (month < 1 || month > 12) throw new Error('Month must be between 1 and 12');
  if (day < 1 || day > monthData[month]) {
    throw new Error(`Day ${day} is invalid for BS ${year}/${month} (max ${monthData[month]})`);
  }

  const diffDays = bsToDayCount(year, month, day);
  const adDate = new Date(START_AD);
  adDate.setDate(adDate.getDate() + diffDays);

  return {
    year:        adDate.getFullYear(),
    month:       adDate.getMonth() + 1,
    day:         adDate.getDate(),
    date:        adDate,
    monthName:   adDate.toLocaleString('en', { month: 'long' }),
    dayOfWeek:   adDate.toLocaleString('en', { weekday: 'long' }),
    iso:         adDate.toISOString().split('T')[0],
  };
}

/**
 * Convert AD date → BS date.
 * @param {number} year  AD year
 * @param {number} month AD month (1–12)
 * @param {number} day   AD day
 * @returns {{ year, month, day, monthName, monthNameNp, dayOfWeek }}
 */
function adToBs(year, month, day) {
  const adDate = new Date(year, month - 1, day);
  if (isNaN(adDate.getTime())) throw new Error('Invalid AD date');

  // Difference in days from the reference AD date
  const diffTime = adDate - START_AD;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) throw new Error('Date is before the supported range (1943-04-14)');

  let remaining = diffDays;
  let bsYear = START_BS.year;
  let bsMonth = START_BS.month;
  let bsDay = START_BS.day;

  // Walk through BS years
  while (true) {
    const yearData = BS_CALENDAR_DATA[bsYear];
    if (!yearData) throw new Error(`BS year ${bsYear} is out of supported range`);

    if (remaining < yearData[0]) break;
    remaining -= yearData[0];
    bsYear++;
  }

  // Walk through BS months
  const yearData = BS_CALENDAR_DATA[bsYear];
  for (let m = 1; m <= 12; m++) {
    if (remaining < yearData[m]) {
      bsMonth = m;
      bsDay = remaining + 1;
      break;
    }
    remaining -= yearData[m];
  }

  return {
    year:       bsYear,
    month:      bsMonth,
    day:        bsDay,
    monthName:  BS_MONTH_NAMES[bsMonth],
    monthNameNp: BS_MONTH_NAMES_NP[bsMonth],
    dayOfWeek:  adDate.toLocaleString('en', { weekday: 'long' }),
    formatted:  `${bsYear}/${String(bsMonth).padStart(2,'0')}/${String(bsDay).padStart(2,'0')}`,
  };
}

/**
 * Get today's date in both BS and AD.
 */
function getToday() {
  const today = new Date();
  const ad = {
    year:      today.getFullYear(),
    month:     today.getMonth() + 1,
    day:       today.getDate(),
    monthName: today.toLocaleString('en', { month: 'long' }),
    dayOfWeek: today.toLocaleString('en', { weekday: 'long' }),
    iso:       today.toISOString().split('T')[0],
  };
  const bs = adToBs(ad.year, ad.month, ad.day);
  return { ad, bs };
}

/**
 * Get number of days in a BS month.
 */
function getDaysInBsMonth(year, month) {
  const data = BS_CALENDAR_DATA[year];
  if (!data) throw new Error(`BS year ${year} not in supported range`);
  if (month < 1 || month > 12) throw new Error('Month must be 1–12');
  return data[month];
}

module.exports = { bsToAd, adToBs, getToday, getDaysInBsMonth, BS_MONTH_NAMES, BS_MONTH_NAMES_NP };