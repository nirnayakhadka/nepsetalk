import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Clock, ArrowRight, PenTool } from 'lucide-react';
import { getNews, getImageUrl } from '../../services/adminApi.js';

const OpinionSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getNews('?limit=6');
        setArticles(data);
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <section className="px-2 sm:px-3 lg:px-4 py-12 bg-white min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हुँदैछ...</p>
        </div>
      </section>
    );
  }
  return (
    <section className="px-2 sm:px-3 lg:px-4 py-12 bg-white">
      <div className="mx-auto w-full max-w-[90%]">
        {/* Header with Border */}
        <div className="border-l-4 border-green-600 pl-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-lg shadow-md">
                <PenTool className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">मत र विश्लेषण</h2>
                <p className="text-gray-600 text-sm sm:text-base font-semibold">विशेषज्ञहरूका मत र गहन विश्लेषण</p>
              </div>
            </div>
            <Link
              to="/blog"
              className="hidden md:flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
            >
              सबै हेर्नुहोस्
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Featured Opinion */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Article */}
            {articles.length > 0 && (
            <Link
              to={`/news/${articles[0].id}`}
              className="block bg-white border-2 border-green-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={getImageUrl(articles[0].image) || '/default.jpg'}
                  alt={articles[0].title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute top-6 left-6">
                  <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
                    मुख्य समाचार
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">
                    {articles[0].category_name || 'समाचार'}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 line-clamp-2 group-hover:text-green-300 transition-colors">
                    {articles[0].title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{articles[0].author_name || 'सम्पादक'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(articles[0].created_at).toLocaleDateString('ne')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                <p className="text-base sm:text-lg font-semibold leading-relaxed mb-4 line-clamp-3">
                  {articles[0].excerpt || articles[0].content?.substring(0, 150) + '...'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t-2 border-green-100">
                  <div>
                    <p className="font-bold text-lg text-gray-900">{articles[0].author_name || 'सम्पादक'}</p>
                    <p className="text-base text-gray-600">{articles[0].category_name || 'समाचार'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <span>पूर्ण पढ्नुहोस्</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
            )}

            {/* Other Articles Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {articles.slice(1, 3).map((article) => (
                <Link
                  key={article.id}
                  to={`/news/${article.id}`}
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(article.image) || '/default.jpg'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
                        {article.category_name || 'समाचार'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex flex-col gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{article.author_name || 'सम्पादक'}</p>
                        <p className="text-xs text-gray-500">{article.category_name || 'समाचार'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(article.created_at).toLocaleDateString('ne')}</span>
                      </div>
                      <span className="text-green-600 font-semibold">{article.views || 0} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Latest News */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-2xl font-bold text-gray-900">ताजा समाचार</h3>
              </div>
              <div className="space-y-4">
                {articles.slice(2, 5).map((article) => (
                  <Link
                    key={article.id}
                    to={`/news/${article.id}`}
                    className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(article.thumbnail || article.image)}
                        alt={article.title || 'Article image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                        }}
                      />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className='font-semibold'>{article.author_name || 'सम्पादक'}</span>
                          <span>•</span>
                          <span className='font-semibold'>{new Date(article.created_at).toLocaleDateString('ne')}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* View All Button */}
            <Link
              to="/news"
              className="block w-full bg-green-600 text-white text-center py-4 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              सबै समाचार हेर्नुहोस्
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpinionSection;
