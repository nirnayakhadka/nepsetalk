import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, ArrowRight, Flame } from 'lucide-react';
import { getRecentNews, getImageUrl } from '../../services/adminApi.js';

const TrendingNews = () => {
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentNews()
      .then((data) => {
        // Client-side trending: sort by id or assume backend sorts, slice 8
        const sorted = data.slice(0, 8).sort((a, b) => (b.views || 0) - (a.views || 0));
        setTrendingNews(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="px-2 sm:px-3 lg:px-4 py-10 bg-white">Loading trending...</div>;
  }

  return (
    <section id='ट्रेन्डिङसमाचार' className="px-2 sm:px-3 lg:px-4 py-10 bg-white">
      <div className="mx-auto w-full max-w-[90%]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">ट्रेन्डिङ समाचार</h2>
              <p className="text-xs sm:text-sm text-gray-600">आजका सबैभन्दा लोकप्रिय समाचारहरू</p>
            </div>
          </div>
          <Link to="/news" className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2">
            सबै हेर्नुहोस्
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingNews.map((news, index) => (
            <Link
              key={`trending-card-${news.id}`}
              to={`/news/${news.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-200"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getImageUrl(news.image) || '/default-news.jpg'}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    #{index + 1}
                  </span>
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                    {news.category_name || 'समाचार'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{news.time || new Date(news.created_at).toLocaleString('ne')}</span>
                  </div>
                  <span className="text-green-600 font-semibold">{news.views || 'N/A'} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingNews;

