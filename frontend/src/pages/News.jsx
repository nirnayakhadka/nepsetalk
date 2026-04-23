import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, ArrowRight, Flame, Radio, Newspaper, TrendingUp } from 'lucide-react';
import { getNews, getImageUrl, DEFAULT_IMAGE_URL } from '../services/adminApi.js';
import AdSlot from '../components/ads/AdSlot';

const News = () => {
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await getNews('?limit=50');
        setAllNews(newsData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="px-3 sm:px-6 lg:px-10 py-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">समाचार लोड हुँदैछ...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-3 sm:px-6 lg:px-10 py-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">त्रुटि</p>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  const featured = allNews[0];
  const secondary = allNews.slice(1, 3);
  const sidebarStories = allNews.slice(3);

  return (
    <section className="px-3 sm:px-6 lg:px-10 py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto w-full max-w-[90%] space-y-10">
        <div className="border-l-4 border-green-600 pl-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-lg shadow-md">
                <Newspaper className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="uppercase tracking-[0.2em] text-xs text-green-600 font-semibold mb-1">Live Desk</p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">ताजा समाचार अपडेट</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">डेभलपिंग स्टोरीहरू एउटै डिजाइनमा, फरक सामग्रीका साथ</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-gray-600 bg-white border border-green-100 px-4 py-2 rounded-full shadow-sm">
              <Radio className="w-4 h-4 text-green-600" />
              प्रत्यक्ष अपडेट
            </span>
          </div>
        </div>

        {/* Hero Banner Ad */}
        <AdSlot position="hero_banner" className="mb-6" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {featured && (
              <Link
                to={`/news/${featured.id}`}
                className="block bg-white border-2 border-green-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={getImageUrl(featured.image) || '/default.jpg'}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-6 left-6 flex flex-wrap gap-3">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                      <Flame className="w-4 h-4" />
                      प्रमुख खबर
                    </span>
                    <span className="bg-green-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {featured.category_name || 'समाचार'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:text-green-200 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-sm md:text-base text-white/80 line-clamp-2">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs md:text-sm text-white/80 mt-4">
                      <span className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {featured.author_name || 'सम्पादक'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(featured.created_at).toLocaleDateString('ne')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{featured.author_name || 'सम्पादक'}</p>
                    <p className="text-sm text-gray-500">{featured.category_name || 'समाचार'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    अझ पढ्नुहोस्
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {secondary.map((story) => (
                <Link
                  key={`secondary-${story.id}`}
                  to={`/news/${story.id}`}
                  className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={getImageUrl(story.image) || '/default.jpg'}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {story.category_name || 'समाचार'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{story.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {story.author_name || 'सम्पादक'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(story.created_at).toLocaleDateString('ne')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
  <div className="flex items-center gap-2 mb-4">
    <Newspaper className="w-5 h-5 text-green-600" />
    <h3 className="text-xl font-bold text-gray-900">छोटो अपडेटहरू</h3>
  </div>
  <div className="space-y-4">
    {sidebarStories.slice(0, 20).map((story, index) => (
      <React.Fragment key={`list-${story.id}`}>
        <Link
          to={`/news/${story.id}`}
          className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-green-100"
        >
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={getImageUrl(story.thumbnail || story.image)}
              alt={story.title || 'News image'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_IMAGE_URL;
              }}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">{story.category_name || 'समाचार'}</p>
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{story.title}</h4>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{story.author_name || 'सम्पादक'}</span>
              <span>•</span>
              <span>{new Date(story.created_at).toLocaleDateString('ne')}</span>
            </div>
          </div>
        </Link>
        {(index + 1) % 4 === 0 && <AdSlot position="infeed" />}
      </React.Fragment>
    ))}
  </div>
</div>
          </div>

          <aside className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Trending Stories</h3>
              </div>
              <div className="space-y-4">
                {sidebarStories.slice(0, 5).map((story, index) => (
                  <Link
                    key={`trending-${story.id}`}
                    to={`/news/${story.id}`}
                    className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-green-200 hover:shadow-sm transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{story.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(story.created_at).toLocaleDateString('ne')}</span>
                        <span>•</span>
                        <span>{story.views || 0} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Ad */}
            <AdSlot position="sidebar" />

            <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -left-10 bottom-0 w-24 h-24 bg-white/5 rounded-full" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-bold">अलर्टहरू प्राप्त गर्नुहोस्</h3>
                <p className="text-white/80">
                  तपाईंको मन पर्ने विषय छनोट गर्नुहोस् र रियल-टाइम अपडेट प्रत्यक्ष मोबाइलमा पाउनुहोस्।
                </p>
                <Link
                  to="/category/बजार"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full font-semibold hover:bg-white/20 transition-colors"
                >
                  सूचना सक्रिय गर्नुहोस्
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default News;

