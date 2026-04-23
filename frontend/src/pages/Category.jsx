import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowRight, Search, Tag, ChevronRight, Flame, TrendingUp, Calendar, User } from 'lucide-react';
import { getNews, getCategoriesList, getImageUrl } from '../services/adminApi.js';
import AdSlot from '../components/ads/AdSlot';

const slugify = (text) =>
  text?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') ?? '';

const formatDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('ne-NP', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return ''; }
};

const DEFAULT_IMG = 'https://via.placeholder.com/600x400?text=No+Image';

// Colour palette — one per category index, cycles
const PALETTE = [
  'blue', 'green', 'red', 'purple', 'orange', 'teal', 'pink', 'indigo',
];
const PALETTE_CLASSES = {
  blue:   { header: 'bg-blue-600',   badge: 'bg-blue-600',   tab: 'border-blue-500 text-blue-700',   hover: 'hover:text-blue-600'   },
  green:  { header: 'bg-green-700',  badge: 'bg-green-700',  tab: 'border-green-600 text-green-700', hover: 'hover:text-green-600'  },
  red:    { header: 'bg-red-600',    badge: 'bg-red-600',    tab: 'border-red-500 text-red-700',     hover: 'hover:text-red-600'    },
  purple: { header: 'bg-purple-600', badge: 'bg-purple-600', tab: 'border-purple-500 text-purple-700', hover: 'hover:text-purple-600'},
  orange: { header: 'bg-orange-500', badge: 'bg-orange-500', tab: 'border-orange-400 text-orange-600', hover: 'hover:text-orange-500'},
  teal:   { header: 'bg-teal-600',   badge: 'bg-teal-600',   tab: 'border-teal-500 text-teal-700',   hover: 'hover:text-teal-600'   },
  pink:   { header: 'bg-pink-600',   badge: 'bg-pink-600',   tab: 'border-pink-500 text-pink-700',   hover: 'hover:text-pink-600'   },
  indigo: { header: 'bg-indigo-600', badge: 'bg-indigo-600', tab: 'border-indigo-500 text-indigo-700', hover: 'hover:text-indigo-600'},
};

const Category = () => {
  const { categoryName } = useParams();

  const [allCategories, setAllCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [news, setNews]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Resolve which category matches the URL slug ───────────────────────────
  const resolveCategory = (cats, slug) =>
    cats.find(c => c.slug === slug || slugify(c.name) === slug || slugify(c.slug) === slug);

  // ── Fetch all published news for a given category id ─────────────────────
  const fetchNewsForCategory = async (cat) => {
    setLoading(true);
    try {
      const res = await getNews({ status: 'published', limit: 100 });
      const all = Array.isArray(res) ? res : (res?.data ?? []);
      setNews(all.filter(n => n.category_id === cat.id || n.category_name === cat.name));
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategoriesList();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        // Only categories that have at least 1 published news
        const withNews = list.filter(c => Number(c.news_count) > 0);
        setAllCategories(withNews);

        const matched = resolveCategory(withNews, categoryName) ?? withNews[0];
        setActiveCategory(matched);
        if (matched) await fetchNewsForCategory(matched);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    init();
  }, [categoryName]);

  // ── Switch category tab ───────────────────────────────────────────────────
  const switchCategory = async (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
    window.history.pushState({}, '', `/category/${slugify(cat.slug || cat.name)}`);
    await fetchNewsForCategory(cat);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const catIndex   = allCategories.findIndex(c => c.id === activeCategory?.id);
  const colorKey   = PALETTE[catIndex >= 0 ? catIndex % PALETTE.length : 0];
  const pal        = PALETTE_CLASSES[colorKey];

  const filteredNews = news.filter(n => {
    const q = searchQuery.toLowerCase();
    return !q || n.title.toLowerCase().includes(q) || (n.excerpt ?? '').toLowerCase().includes(q);
  });

  const featuredNews  = filteredNews[0] ?? null;
  const secondaryNews = filteredNews.slice(1, 4);
  const gridNews      = filteredNews.slice(4);

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-red-600">समाचार लोड गर्न सकिएन: {error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[90%] mx-auto px-4 py-2 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-green-700 transition-colors">गृहपृष्ठ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/news" className="hover:text-green-700 transition-colors">समाचार</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-medium">{activeCategory?.name ?? categoryName}</span>
        </div>
      </div>

      {/* ── Category header banner ── */}
      <div className={`${pal.header} text-white`}>
        <div className="max-w-[90%] mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">{activeCategory?.name ?? categoryName}</h1>
          {activeCategory?.description && (
            <p className="text-white/80 mt-1 text-sm">{activeCategory.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
            <span className="bg-white/20 px-3 py-0.5 rounded-full">{filteredNews.length} समाचार</span>
            <span>•</span>
            <span>ताजा अपडेट</span>
          </div>
        </div>
      </div>

      {/* ── Category tab bar ── */}
      <div className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-[90%] mx-auto px-4 overflow-x-auto">
          <div className="flex gap-0 py-0 min-w-max">
            {allCategories.map((cat, idx) => {
              const pk  = PALETTE[idx % PALETTE.length];
              const pp  = PALETTE_CLASSES[pk];
              const isActive = cat.id === activeCategory?.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => switchCategory(cat)}
                  className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                    isActive
                      ? `${pp.tab} border-b-2`
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  {cat.name}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                    isActive ? 'bg-current/10' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {cat.news_count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[90%] mx-auto px-4 py-8">

        <AdSlot position="hero_banner" className="mb-6" />

        {/* ── Search bar (matching Blog.jsx style) ── */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="समाचार खोज्नुहोस्..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* ── Loading skeletons (matching Blog.jsx style) ── */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-xl text-slate-600">यस श्रेणीमा कुनै समाचार छैन</p>
            <p className="text-slate-400 mt-2">
              {searchQuery ? 'कृपया खोज परिवर्तन गर्नुहोस्' : 'छिट्टै नयाँ समाचार आउनेछ'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-600 hover:underline text-sm font-medium">
                खोज हटाउनुहोस्
              </button>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {!loading && filteredNews.length > 0 && (
          <>
            {/* Featured + secondary stack */}
            {featuredNews && (
              <div className="grid lg:grid-cols-3 gap-6 mb-8">

                {/* Featured large card */}
                <Link
                  to={`/news/${featuredNews.id}`}
                  className="lg:col-span-2 group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-64 lg:h-80 overflow-hidden bg-slate-200">
                    <img
                      src={getImageUrl(featuredNews.image) || DEFAULT_IMG}
                      alt={featuredNews.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={e => { e.target.src = DEFAULT_IMG; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className={`${pal.badge} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                        <Flame className="w-3 h-3" /> मुख्य समाचार
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-xl lg:text-2xl font-bold text-white leading-snug line-clamp-2 group-hover:text-yellow-300 transition-colors">
                        {featuredNews.title}
                      </h2>
                      {featuredNews.excerpt && (
                        <p className="text-white/70 text-sm mt-1 line-clamp-2">{featuredNews.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
                        {featuredNews.author_name && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{featuredNews.author_name}</span>
                        )}
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(featuredNews.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Secondary stack */}
                <div className="flex flex-col gap-4">
                  {secondaryNews.map(n => (
                    <Link key={n.id} to={`/news/${n.id}`}
                      className="group flex gap-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 overflow-hidden">
                      <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
                        <img
                          src={getImageUrl(n.image) || DEFAULT_IMG}
                          alt={n.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={e => { e.target.src = DEFAULT_IMG; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-bold text-gray-900 line-clamp-3 ${pal.hover} transition-colors leading-snug`}>
                          {n.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(n.published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <AdSlot position="infeed" className="mb-6" />

            {/* ── News grid (matching Blog.jsx card style exactly) ── */}
            {gridNews.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-5 h-5 text-slate-500" />
                  <h2 className="text-xl font-bold text-slate-900">थप समाचार</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridNews.map((n, index) => (
                    <React.Fragment key={n.id}>
                      <Link
                        to={`/news/${n.id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-48 overflow-hidden bg-slate-200">
                          <img
                            src={getImageUrl(n.image) || DEFAULT_IMG}
                            alt={n.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={e => { e.target.src = DEFAULT_IMG; }}
                          />
                          <div className="absolute top-4 left-4">
                            <span className={`${pal.badge} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                              {activeCategory?.name}
                            </span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-6">
                          <h3 className={`text-xl font-bold text-slate-900 mb-3 ${pal.hover} transition-colors line-clamp-2`}>
                            {n.title}
                          </h3>
                          {n.excerpt && (
                            <p className="text-slate-600 text-sm mb-4 line-clamp-3">{n.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                            <div className="flex items-center gap-4">
                              {n.author_name && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{n.author_name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(n.published_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                            <span>पूर्ण पढ्नुहोस्</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>

                      {/* Infeed ad every 6 cards */}
                      {(index + 1) % 6 === 0 && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <AdSlot position="infeed" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}
          </>
        )}

       
        <div className="mt-8 text-center">
          <Link to="/news" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            सबै समाचार हेर्नुहोस्
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Category;