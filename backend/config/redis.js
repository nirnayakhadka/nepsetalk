/**
 * config/redis.js
 * Redis client with graceful degradation.
 * If Redis is unavailable, an in-memory Map is used as a fallback
 * so the server never crashes due to cache failures.
 */

const redis = require('redis');

// ─── In-memory fallback ────────────────────────────────────────────────────
class MemoryCache {
  constructor() {
    this._store = new Map();
    this._ttls = new Map();
  }

  async get(key) {
    const exp = this._ttls.get(key);
    if (exp && Date.now() > exp) {
      this._store.delete(key);
      this._ttls.delete(key);
      return null;
    }
    return this._store.get(key) ?? null;
  }

  async set(key, value) {
    this._store.set(key, value);
    return 'OK';
  }

  async setEx(key, ttlSeconds, value) {
    this._store.set(key, value);
    this._ttls.set(key, Date.now() + ttlSeconds * 1000);
    return 'OK';
  }

  async del(key) {
    this._store.delete(key);
    this._ttls.delete(key);
    return 1;
  }

  async keys(pattern) {
    const re = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return [...this._store.keys()].filter((k) => re.test(k));
  }

  async ping() {
    return 'PONG';
  }
}

// ─── Redis client ──────────────────────────────────────────────────────────
let client;
let usingFallback = false;

function createClient() {
  if (usingFallback) return; // already failed, skip retries

  const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.warn('[Redis] Max retries reached, switching to memory cache');
          usingFallback = true;
          client = new MemoryCache();
          return false; // stop retrying
        }
        return Math.min(retries * 500, 3000);
      },
    },
  });

  redisClient.on('connect', () => {
    console.log('[Redis] ✅ Connected');
    usingFallback = false;
  });

  redisClient.on('error', (err) => {
    if (!usingFallback) {
      console.warn('[Redis] ⚠️  Error:', err.message);
    }
  });

  redisClient.connect().catch((err) => {
    console.warn('[Redis] Connection failed, using memory fallback:', err.message);
    usingFallback = true;
    client = new MemoryCache();
  });

  client = redisClient;
}

createClient();

// ─── Proxy – always delegates to whichever client is active ───────────────
const cacheProxy = {
  async get(key) {
    try {
      return await client.get(key);
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      return await client.set(key, value);
    } catch {
      return null;
    }
  },

  async setEx(key, ttl, value) {
    try {
      return await client.setEx(key, ttl, value);
    } catch {
      return null;
    }
  },

  async del(key) {
    try {
      return await client.del(key);
    } catch {
      return null;
    }
  },

  async keys(pattern) {
    try {
      return await client.keys(pattern);
    } catch {
      return [];
    }
  },

  isUsingFallback() {
    return usingFallback;
  },
};

// ─── Helper: JSON-aware cache ──────────────────────────────────────────────
cacheProxy.getJSON = async (key) => {
  const raw = await cacheProxy.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

cacheProxy.setJSON = async (key, value, ttlSeconds = 60) => {
  return cacheProxy.setEx(key, ttlSeconds, JSON.stringify(value));
};

module.exports = cacheProxy;