import React, { useState, useEffect } from "react";
import { ArrowRight, Flame, Clock, Activity } from "lucide-react";
import { getNews, getImageUrl } from "../../services/adminApi";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HeroNewsGrid = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBreaking, setCurrentBreaking] = useState(0);
  const [marketStats, setMarketStats] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [topStocks, setTopStocks] = useState([]);

  useEffect(() => {
    fetchNews();
    fetchMarket();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBreaking((prev) => (prev + 1) % news.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [news.length]);

  const fetchNews = async () => {
    try {
      const data = await getNews("?limit=10");
      setNews(data);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarket = async () => {
    try {
      // Fetch both in parallel
      const [marketRes, gainersRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/nepse/market`),
        fetch(`${API_BASE}/api/nepse/movers/gainers`),
      ]);

      const marketJson =
        marketRes.status === "fulfilled" ? await marketRes.value.json() : null;
      const gainersJson =
        gainersRes.status === "fulfilled"
          ? await gainersRes.value.json()
          : null;

      const d = marketJson?.data ?? {};

      // Use gainers from /movers/gainers if market endpoint returns empty
      const rawGainers =
        (d.gainers?.length > 0 ? d.gainers : gainersJson?.data) ?? [];

      // Sort by percentChange descending and pick top gainer
      const sortedGainers = [...rawGainers].sort(
        (a, b) =>
          Number(b.percentChange ?? b.change ?? 0) -
          Number(a.percentChange ?? a.change ?? 0),
      );
      const topGainer = sortedGainers[0] ?? null;

      setMarketStats([
        {
          label: topGainer?.symbol ?? "TOP GAINER",
          value: topGainer
            ? `Rs ${Number(topGainer.ltp ?? 0).toFixed(2)}`
            : "—",
          delta: topGainer
            ? `+${Number(topGainer.percentChange ?? topGainer.change ?? 0).toFixed(2)}% आज`
            : "—",
          positive: true,
        },
        {
          label: "कारोबार",
          value: `रु ${d.totalTurnover?.value ?? "—"} ${d.totalTurnover?.unit ?? ""}`,
          delta: "कुल कारोबार",
          positive: true,
        },
        {
          label: "कुल स्क्रिप",
          value: String(d.activeStocks?.value ?? "—"),
          delta: `${d.activeStocks?.gainers ?? 0} ↑ / ${d.activeStocks?.losers ?? 0} ↓`,
          positive: true,
        },
        {
          label: "स्रोत",
          value: (d.source ?? "N/A").toUpperCase(),
          delta: d.fetchedAt
            ? new Date(d.fetchedAt).toLocaleTimeString("en", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
          positive: true,
        },
      ]);

      setTopStocks(
        sortedGainers.slice(0, 3).map((s) => ({
          symbol: s.symbol,
          price: Number(s.ltp ?? 0).toFixed(1),
          change: `${(s.percentChange ?? s.change ?? 0) >= 0 ? "+" : ""}${Number(s.percentChange ?? s.change ?? 0).toFixed(1)}%`,
          positive: (s.percentChange ?? s.change ?? 0) >= 0,
        })),
      );
    } catch (err) {
      console.error("Market stats fetch failed:", err);
    } finally {
      setMarketLoading(false);
    }
  };

  // Nepali date helper (approximate)
  const getNepaliDate = () => {
    return new Date().toLocaleDateString("ne-NP", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-[90%] text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">लोड हुँदैछ...</p>
        </div>
      </section>
    );
  }

  const breakingNews = news.map((n) => n.title).filter((t) => t);
  const featuredNews = news[0];
  const bulletinStories = news.slice(1, 7);

  return (
    <section className="bg-slate-50">
      {/* Breaking News Ticker */}
      <div className="bg-green-600 text-white overflow-hidden">
        <div className="mx-auto max-w-[90%] px-2 sm:px-3 lg:px-4">
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded">
              <Flame className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                ब्रेकिङ न्यूज
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-base sm:text-lg lg:text-xl font-medium transition-all duration-500">
                {breakingNews[currentBreaking]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-3 lg:px-4 py-6">
        <div className="mx-auto max-w-[90%] space-y-5">
          {/* Date and Navigation */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 font-medium text-xs sm:text-sm">
                {getNepaliDate()}
              </span>
            </div>
            <div className="hidden md:flex gap-4 text-xs font-semibold text-slate-700">
              {["मुख्य", "राजनीति", "अर्थ", "समाज", "खेलकुद"].map((label) => (
                <button
                  key={label}
                  className="hover:text-red-600 transition-colors text-[10px] sm:text-xs"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {marketLoading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-3 animate-pulse h-20"
                    />
                  ))
              : marketStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs font-bold text-slate-600">
                      {stat.label}
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p
                      className={`text-[10px] sm:text-xs font-semibold ${stat.positive ? "text-green-600" : "text-red-600"}`}
                    >
                      {stat.delta}
                    </p>
                  </div>
                ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-5">
              {featuredNews && (
                <article className="rounded-lg overflow-hidden border border-slate-200 shadow-md bg-white">
                  <div className="grid md:grid-cols-[1.4fr,0.6fr]">
                    <Link to={`/news/${featuredNews.id}`} className="block">
                      <div className="relative bg-slate-900 text-white min-h-[280px]">
                        {getImageUrl(featuredNews.image) ? (
                          <img
                            src={getImageUrl(featuredNews.image)}
                            alt={featuredNews.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                        )}
                        <div className="relative p-6 space-y-3 h-full flex flex-col justify-end">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-600 px-3 py-1 rounded">
                              <Flame className="w-3 h-3" /> मुख्य समाचार
                            </span>
                            <span className="text-xs text-white/80">
                              •{" "}
                              {new Date(
                                featuredNews.created_at,
                              ).toLocaleDateString("ne")}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight line-clamp-3">
                            {featuredNews.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-3">
                            {featuredNews.excerpt ||
                              featuredNews.content?.substring(0, 150)}
                          </p>
                          <div className="flex items-center gap-3 pt-2">
                            <button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-md text-sm transition-colors">
                              पूर्ण समाचार पढ्नुहोस्{" "}
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-white/70">
                              • {featuredNews.category_name || "समाचार"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="bg-white p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#484848]">
                          ताजा समाचार
                        </h3>
                        <Link
                          to="/news"
                          className="text-xs text-red-600 font-bold hover:underline"
                        >
                          सबै हेर्नुहोस्
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {bulletinStories.map((item, idx) => (
                          <Link
                            key={idx}
                            to={`/news/${item.id}`}
                            className="group cursor-pointer block"
                          >
                            <div className="flex items-start gap-2 mb-1">
                              <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                {item.category_name || "समाचार"}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(item.created_at).toLocaleDateString(
                                  "ne",
                                )}
                              </span>
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-[#484848] leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                              {item.title}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Live Top Stocks Widget */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-600" />
                    टप गेनर्स
                  </h3>
                  <Link
                    to="/stock"
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    सबै हेर्नुहोस्
                  </Link>
                </div>
                <div className="space-y-3">
                  {marketLoading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="h-12 rounded-lg bg-slate-100 animate-pulse"
                        />
                      ))
                  ) : topStocks.length > 0 ? (
                    topStocks.map((stock, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">
                              {stock.symbol}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stock.positive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {stock.change}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            Rs {stock.price}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">
                      डाटा उपलब्ध छैन
                    </p>
                  )}
                </div>
              </div>

              {/* Popular News — from real news data */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    लोकप्रिय
                  </h3>
                </div>
                <div className="space-y-3">
                  {news.slice(7, 10).map((item, index) => (
                    <Link
                      key={index}
                      to={`/news/${item.id}`}
                      className="group cursor-pointer pb-3 border-b border-slate-100 last:border-b-0 block"
                    >
                      <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded mb-1">
                        {item.category_name || "समाचार"}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                    </Link>
                  ))}
                  {news.slice(7, 10).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">
                      डाटा उपलब्ध छैन
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  द्रुत लिंक
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "म्युचुअल फन्ड", icon: "💰", to: "/stock" },
                    { label: "बिमा", icon: "🛡️", to: "/stock" },
                    { label: "बजार", icon: "📊", to: "/stock" },
                    { label: "इतिहास", icon: "📈", to: "/stock" },
                  ].map((link, index) => (
                    <Link
                      key={index}
                      to={link.to}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all group"
                    >
                      <span className="text-base">{link.icon}</span>
                      <span className="text-xs font-medium text-slate-700 group-hover:text-red-700">
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroNewsGrid;
