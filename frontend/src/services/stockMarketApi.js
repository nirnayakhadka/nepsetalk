/**
 * services/stockMarketApi.js
 *
 * Connects to the NEPSE backend via:
 *   1. Socket.IO websocket (real-time push)  ← preferred
 *   2. REST GET /api/nepse/market            ← polling fallback
 *
 * Usage:
 *   import { fetchStockMarketData, subscribeMarket, unsubscribeMarket } from './stockMarketApi';
 *
 *   // One-time fetch (for SSR / initial load)
 *   const data = await fetchStockMarketData();
 *
 *   // Live subscription
 *   const unsub = subscribeMarket((data) => setMarketData(data));
 *   // later: unsub();
 */

import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── REST: one-shot fetch ──────────────────────────────────────────────────
export async function fetchStockMarketData() {
  const res = await fetch(`${API_BASE}/api/nepse/market`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.data;           // normalized marketData object
}

// ─── REST: historical data ─────────────────────────────────────────────────
export async function fetchMarketHistory(days = 30) {
  const res = await fetch(`${API_BASE}/api/nepse/history?days=${days}`);
  if (!res.ok) throw new Error(`History fetch failed: HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

// ─── REST: daily OHLC stats ────────────────────────────────────────────────
export async function fetchDailyStats(days = 90) {
  const res = await fetch(`${API_BASE}/api/nepse/daily-stats?days=${days}`);
  if (!res.ok) throw new Error(`Daily stats fetch failed: HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

// ─── Socket.IO live subscription ──────────────────────────────────────────
let socket = null;
let listeners = new Set();

function getSocket() {
  if (socket && socket.connected) return socket;

  socket = io(`${API_BASE}/nepse`, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('[NEPSE Socket] ✅ Connected');
  });

  socket.on('marketUpdate', (payload) => {
    listeners.forEach((cb) => {
      try {
        cb(payload.data, payload.isMarketOpen);
      } catch (e) {
        console.error('[NEPSE Socket] Listener error:', e);
      }
    });
  });

  socket.on('marketError', (err) => {
    console.warn('[NEPSE Socket] Server error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.warn('[NEPSE Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[NEPSE Socket] Connection error:', err.message);
    // Automatically falls back to polling in the component
  });

  return socket;
}

/**
 * Subscribe to live market updates.
 * @param {(data: object, isMarketOpen: boolean) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribeMarket(callback) {
  listeners.add(callback);
  getSocket(); // ensure connected
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && socket) {
      socket.disconnect();
      socket = null;
    }
  };
}

/**
 * Force a server-side refresh (admin / debug use).
 */
export async function triggerRefresh() {
  const res = await fetch(`${API_BASE}/api/nepse/refresh`, { method: 'POST' });
  return res.json();
}

/**
 * Request an immediate update over socket.
 */
export function requestSocketUpdate() {
  if (socket?.connected) socket.emit('requestUpdate');
}

// Add these to your existing stockMarketApi.js

// Fetch top gainers/losers
export async function fetchTopMovers(category = 'gainers', limit = 10) {
  const res = await fetch(`${API_BASE}/api/nepse/movers/${category}?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category}`);
  const json = await res.json();
  return json.data;
}

// Fetch all stocks
export async function fetchAllStocks(date = null) {
  const url = date ? `/api/nepse/stocks?date=${date}` : '/api/nepse/stocks';
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error('Failed to fetch stocks');
  const json = await res.json();
  return json.data;
}

// Fetch single stock detail
export async function fetchStockDetail(symbol) {
  const res = await fetch(`${API_BASE}/api/nepse/stock?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
  const json = await res.json();
  return json.data;
}

// Fetch stock history
export async function fetchStockHistory(symbol, days = 30) {
  const res = await fetch(`${API_BASE}/api/nepse/stock/history?symbol=${symbol}&days=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}`);
  const json = await res.json();
  return json.data;
}

// Fetch sectors
export async function fetchSectors() {
  const res = await fetch(`${API_BASE}/api/nepse/sectors`);
  if (!res.ok) throw new Error('Failed to fetch sectors');
  const json = await res.json();
  return json.data;
}

// Fetch IPO calendar
export async function fetchIPOCalendar(status = 'upcoming') {
  const res = await fetch(`${API_BASE}/api/nepse/ipo?status=${status}`);
  if (!res.ok) throw new Error('Failed to fetch IPO calendar');
  const json = await res.json();
  return json.data;
}