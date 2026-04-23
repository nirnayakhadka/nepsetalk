// services/dateApi.js
// Drop this next to your adminApi.js and import wherever needed.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get today's date in both BS and AD.
 * @returns {{ ad: {...}, bs: {...} }}
 */
export const getTodayDate = async () => {
  const res = await fetch(`${BASE_URL}/api/date/today`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data; // { ad: { year, month, day, monthName, dayOfWeek, iso }, bs: { ... } }
};

/**
 * Convert a BS date to AD.
 * @param {number} year  BS year
 * @param {number} month BS month (1–12)
 * @param {number} day   BS day
 * @returns {{ year, month, day, monthName, dayOfWeek, iso }}
 */
export const bsToAd = async (year, month, day) => {
  const res = await fetch(`${BASE_URL}/api/date/bs-to-ad`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ year, month, day }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.output;
};

/**
 * Convert an AD date to BS.
 * @param {number} year  AD year
 * @param {number} month AD month (1–12)
 * @param {number} day   AD day
 * @returns {{ year, month, day, monthName, monthNameNp, dayOfWeek, formatted }}
 */
export const adToBs = async (year, month, day) => {
  const res = await fetch(`${BASE_URL}/api/date/ad-to-bs`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ year, month, day }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.output;
};

/**
 * Get how many days are in a given BS month (for calendar rendering).
 * @param {number} year  BS year
 * @param {number} month BS month
 * @returns {number} days
 */
export const getDaysInBsMonth = async (year, month) => {
  const res = await fetch(`${BASE_URL}/api/date/bs-month-days?year=${year}&month=${month}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.days;
};