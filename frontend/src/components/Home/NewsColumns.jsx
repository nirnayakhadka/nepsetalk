import React, { useState, useEffect } from 'react';
import { ArrowRight, Bookmark, Flame } from 'lucide-react';
import { getRecentNews, getImageUrl } from '../../services/adminApi.js';

const NewsColumns = () => {
  const [latestNews, setLatestNews] = useState([]);
  const [popularNews, setPopularNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentNews()
      .then((data) => {
        setLatestNews(data.slice(0, 4));
        setPopularNews(data.slice(4, 8).sort((a, b) => (b.views || 0) - (a.views || 0)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="px-2 sm:px-3 lg:px-4 py-10 bg-gradient-to-r from-green-100 to-orange-50 min-h-[400px] flex items-center justify-center">Loading...</section>;
  }

  return (
    <section className="px-2 sm:px-3 lg:px-4 py-10 bg-gradient-to-r from-green-100 to-orange-50">
      <div className="mx-auto w-full max-w-[90%] grid md:grid-cols-3 gap-4">
        {/* Latest */}
        <article className="bg-white rounded-3xl shadow p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Latest</p>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">ताजा अपडेट</h3>
            </div>
            <Bookmark className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {latestNews.map((story) => (
              <div key={story.id} className="flex gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 cursor-pointer group">
                <img
                  src={getImageUrl(story.image) || '/default.jpg'}
                  alt={story.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity"
                />
                <div className="flex-1">
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{story.title}</p>
                  <p className="text-base text-slate-500 mt-1">{story.time || new Date(story.created_at).toLocaleString('ne')}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-2">
            थप समाचार
            <ArrowRight className="w-4 h-4" />
          </button>
        </article>

        {/* Popular */}
        <article className="bg-white rounded-3xl shadow p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Popular</p>
              <h3 className="text-xl font-semibold text-slate-900">धेरै पढिएको</h3>
            </div>
            <Flame className="w-5 h-5 text-rose-400" />
          </div>
          <div className="space-y-4">
            {popularNews.map((story, idx) => (
              <div key={story.id} className="flex items-start gap-3 cursor-pointer group">
                <span className="text-2xl font-bold text-slate-200 group-hover:text-rose-400 transition-colors mt-1">{idx + 1}</span>
                <img
                  src={getImageUrl(story.image) || '/default.jpg'}
                  alt={story.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity"
                />
                <div className="flex-1 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <p className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{story.title}</p>
                  <p className="text-base text-slate-500 mt-1">{story.views || 'N/A'} views</p>
                </div>
              </div>
            ))}
          </div>
          <button className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-2">
            सबै हेर्नुहोस्
            <ArrowRight className="w-4 h-4" />
          </button>
        </article>

        {/* Notice board - static OK */}
        <article className="bg-white rounded-3xl shadow p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Notice board</p>
              <h3 className="text-xl font-semibold text-slate-900">सार्वजनिक सूचना</h3>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                <p className="text-lg font-semibold text-slate-900">Corporate & IPO actions</p>
                <p className="text-base text-slate-500 mt-1">Updated {idx + 1} hrs ago</p>
              </div>
            ))}
          </div>
          <button className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-2">
            Calendar
            <ArrowRight className="w-4 h-4" />
          </button>
        </article>
      </div>
    </section>
  );
};

export default NewsColumns;

