/**
 * server.js  — Nepalytix / NEPSE Talk
 * Drop-in replacement for your existing server.js.
 * Adds: NEPSE market routes, Socket.IO, scheduled data fetching.
 */

require('dotenv').config();
const express    = require('express');
const path       = require('path');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const http       = require('http');
const { Server } = require('socket.io');

const { testConnection } = require('./config/db');
const { apiLimiter }     = require('./middleware/rateLimiter');
const errorHandler        = require('./middleware/errorHandler');

// ── Existing routes ────────────────────────────────────────────────────────
const adminRoutes       = require('./routes/admin');
const adminUsersRoutes  = require('./routes/adminUsers');
const newsRoutes        = require('./routes/news');
const categoryRoutes    = require('./routes/categories');
const blogRoutes        = require('./routes/blog');
const videoRoutes       = require('./routes/video');
const adsRoutes         = require('./routes/ads');
const dateRoutes        = require('./routes/dateRoutes');

// ── NEW: NEPSE routes + scheduler + socket ─────────────────────────────────
const nepseRoutes            = require('./routes/nepse');
const { startScheduler }     = require('./jobs/nepseScheduler');
const { stockSocket }        = require('./services/stockSocket');
const { saveSnapshot } = require('./services/nepseSaveService');

// ── Sync new model ─────────────────────────────────────────────────────────
const { NepseSnapshot } = require('./models/nepse');

const app    = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────────────────
const allowedOrigins = [
  ...new Set([
    ...(process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
    ...(process.env.NODE_ENV !== 'production'
      ? [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5174',
          'http://localhost:3000',
        ]
      : []),
  ]),
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

stockSocket(io); // attach /nepse namespace

// ── Express middleware ─────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/api', apiLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/admin',       adminRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/news',        newsRoutes);
app.use('/api/categories',  categoryRoutes);
app.use('/api/blogs',       blogRoutes);
app.use('/api/videos',      videoRoutes);
app.use('/api/ads',         adsRoutes);
app.use('/api/date',        dateRoutes);
app.use('/api/nepse',       nepseRoutes);   

app.get('/health', (req, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString() })
);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

// ── Boot ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

testConnection().then(async () => {
  // Sync NepseSnapshot table (safe – won't drop existing tables)
  await NepseSnapshot.sync({ alter: false }).catch((e) =>
    console.warn('[DB] NepseSnapshot sync warning:', e.message)
  );

  // Start scheduled data fetching
  startScheduler();

  server.listen(PORT, () => {
    console.log(` Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(` NEPSE API: http://localhost:${PORT}/api/nepse/market`);
    console.log(` Socket.IO namespace: ws://localhost:${PORT}/nepse`);
  });
});

module.exports = app;