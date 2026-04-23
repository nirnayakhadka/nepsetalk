# NepseTalk Frontend 🚀

Short & Sweet guide to run and understand the frontend + API integration.

## 🛫 Quickstart

**Backend first (provides API):**
```bash
cd backend
npm install
node server.js  # Runs on http://localhost:5000
```

**Frontend:**
```bash
npm install
npm run dev     # http://localhost:5173 (Vite HMR)
```

Build: `npm run build` → `dist/`

## 🏗️ Complete Architecture

```
frontend/
├── public/          # Static assets
│   ├── vite.svg
│   └── videos/      # Ad videos
├── src/
│   ├── assets/      # Images, mock data, nav ads video
│   │   └── data/navads.mp4
│   ├── components/  # Reusable UI (TailwindCSS)
│   │   ├── Advertisement/  # Adsvideo.jsx
│   │   ├── Carousel/       # Carousel.jsx
│   │   ├── Home/           # CategoryLinks, HeroNewsGrid, NewsColumns, etc.
│   │   ├── Navbar/         # Navbar.jsx
│   │   ├── Nepse/          # Core stock pages:
│   │   │   ├── Analysis.jsx
│   │   │   ├── Markets.jsx
│   │   │   ├── News.jsx
│   │   │   ├── Overview.jsx   ← Main dashboard (uses API)
│   │   │   ├── Portfolio.jsx
│   │   │   └── Watchlist.jsx
│   │   │   └── mockData.js
│   │   ├── News/        # BreakingNewsTicker, EditorsDesk, etc.
│   │   └── Stocks/      # StockCharts.jsx (Recharts)
│   ├── data/            # newsData.js
│   ├── pages/           # Routes (React Router)
│   │   ├── Home.jsx
│   │   ├── StockDashboard.jsx  ← Entry for Nepse
│   │   ├── News.jsx, Blog.jsx, etc.
│   │   ├── Footer.jsx
│   │   └── ScrollToTopButton.jsx
│   ├── services/        # API calls
│   │   └── stockMarketApi.js  ← Mock → Real backend integration
│   ├── App.jsx          # Root + Router
│   ├── main.jsx         # Entry
│   └── index.css        # Global styles
├── package.json         # React 19, Vite, Tailwind4, Recharts, lucide-react, react-router-dom
├── vite.config.js
└── tailwind.config.js (via @tailwindcss/vite)
```

**Key Features:**
- **Nepse Dashboard** (`/stock-dashboard`): Overview/Markets/Analysis/Portfolio/Watchlist.
- **Charts**: Recharts in StockCharts.jsx.
- **Real-time**: Ready for Socket.IO (backend/sockets/stockSocket.js).

## 📰 CMS / News APIs Needed (for dynamic content)

**Backend Base:** `http://localhost:5000/api/news`

**Frontend is STATIC now** → needs these APIs for CMS. All news hardcoded in components/data files.

### Required Endpoints + Pages/Components to Update

| Endpoint | Method | Description | Category Data | Used In Components/Pages | Current Source |
|----------|--------|-------------|---------------|--------------------------|---------------|
| `/breaking` | GET | 5-10 breaking headlines for ticker (title, category) | All | `BreakingNewsTicker.jsx` (Home) | Hardcoded array |
| `/featured` | GET | Hero grid: main hero + bulletin list (title, excerpt, image, category, time) | All | `HeroNewsGrid.jsx` (Home) + marketStats | Hardcoded (marketStats, bulletinStories) |
| `/latest` | GET | Latest news list (title, image, time, `?limit=4`) | All | `NewsColumns.jsx` (latestNews col) | Hardcoded array |
| `/popular` | GET | Popular/trending ranked (title, image, views, `?limit=4`) | All | `NewsColumns.jsx` (popular col), `TrendingNews.jsx` | Hardcoded + newsData.js |
| `/trending` | GET | Trending cards (`?limit=8`, rank, title, image, category, time, views) | All w/ trendingRank | `TrendingNews.jsx` (Home) | newsData.js (trendingRank) |
| `/category/:slug` | GET | Category news list (e.g. `/category/बजार`) | Specific | `CategoryLinks.jsx` → Category.jsx page | Static links |
| `/news/:id` | GET | Single news detail | All | News.jsx, NewsDetail.jsx | Static newsData.js |
| `/search?q=term` | GET | Search news | All | News.jsx search | None |
| `/categories` | GET | List categories (name, slug, icon?) | 8 categories | CategoryLinks.jsx | Hardcoded categories |

**Categories** (from CategoryLinks.jsx): बजार, अर्थ, राजनीति, ऊर्जा, शिक्षा, स्वास्थ्य, कृषि, व्यापार

### Backend Files to Create
```
backend/
├── models/News.js (title, slug, excerpt, content, category, image, author, views, isBreaking, isFeatured, trendingRank)
├── controllers/newsController.js (above endpoints)
├── routes/newsRoutes.js
└── Update server.js: app.use('/api/news', newsRoutes)
```

### Frontend Changes
```
frontend/src/
├── services/newsApi.js (all fetch functions)
├── components/News/BreakingNewsTicker.jsx (fetchBreaking)
├── components/Home/HeroNewsGrid.jsx (fetchFeatured + marketStats? → separate /market-stats?)
├── components/Home/NewsColumns.jsx (fetchLatest, fetchPopular)
├── components/Home/TrendingNews.jsx (fetchTrending → replace newsData.js import)
├── pages/Category.jsx (fetchCategory)
└── pages/News.jsx (fetchAll, search)
```

**Sample News Model Fields:** id, title, slug, excerpt, content (HTML), category, image_url, author, published_at, views, is_breaking, is_featured, trending_rank, home_sections[].

## 📈 Existing APIs (Stocks)

| Endpoint | Used In |
|----------|---------|
| `/api/stocks/marketSummary` | StockCharts.jsx (Home/Nepse), Overview.jsx |

## 🛡️ Admin CMS Dashboard (New!)

**Routes:** `/admin/login` | `/admin/dashboard` (protected)

**Features:**
- Glassmorphism login (demo: `admin@nepsetalk.com` / `admin123`)
- JWT auth (localStorage)
- Dashboard: Stats cards, Recent news, Quick actions (New Article/Categories)
- Protected routes + Navbar
- Ready for News List/Form/Categories CRUD

**Backend Endpoints Needed:**
```
POST /api/admin/login {email, password} → {token, user: {name, email, role}}
GET /api/admin/stats → dashboard metrics
GET /api/news → CRUD integration
```

**Test:** `npm run dev` → localhost:5173/admin/login

## 🚀 Next Steps
1. Backend: Admin auth + News/Category APIs (see CMS table above).
2. Frontend: Fill NewsList/NewsForm/Categories (use adminApi.js).
3. Connect real data to dashboard.

**Tech:** React 19 • Vite • TailwindCSS • Recharts • Auth Context Ready

