import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, ArrowRight } from 'lucide-react';
import { getRecentNews, getImageUrl } from '../../services/adminApi.js';

const MoreNews = () => {
  const [moreNews, setMoreNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentNews()
      .then((data) => setMoreNews(data.slice(0, 6)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="px-2 sm:px-3 lg:px-4 py-10 bg-gray-50">Loading...</div>;
  }

  return (
    <section id="himalayantimes" className="px-2 sm:px-3 lg:px-4 py-10 bg-gray-50">
      <div className="mx-auto w-full max-w-[90%]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">हिमालयन टाईम्स</h2>
            <p className="text-gray-600 font-semibold">ताजा र महत्वपूर्ण समाचारहरू</p>
          </div>
          <Link to="/news" className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2">
            सबै हेर्नुहोस्
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moreNews.map((news) => (
            <Link
              key={`more-${news.id}`}
              to={`/news/${news.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group border border-gray-200"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getImageUrl(news.image) || '/default-news.jpg'}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {news.category_name || 'समाचार'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-gray-600 font-semibold text-base mb-4 line-clamp-2">
                  {news.excerpt || news.content?.substring(0,100) + '...'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className='font-semibold'>{news.author_name || 'सम्पादक'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className='font-semibold'>{news.time || new Date(news.created_at).toLocaleString('ne')}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoreNews;

