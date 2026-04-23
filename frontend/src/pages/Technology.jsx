import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MessageSquare, Eye, TrendingUp, Play } from 'lucide-react';
import { getCategoriesList, getNewsByCategory, getImageUrl } from '../services/adminApi';
import AdSlot from '../components/ads/AdSlot';

const Technology = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('latest');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all categories
        const categories = await getCategoriesList();
        
        // Find Technology category
        const techCategory = categories.find(
          cat => cat.slug?.toLowerCase() === 'technology' || cat.name?.toLowerCase() === 'technology'
        );

        if (techCategory) {
          // Fetch news for Technology category
          const newsData = await getNewsByCategory(techCategory.id);
          setNews(newsData);
        } else {
          setError('Technology category not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        console.error('Error fetching Technology news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[90%] p-2 sm:p-4 mx-auto flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[90%] p-2 sm:p-4 mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  // Prepare data from fetched news
  const mainStory = news[0] || {};
  const sideStories = news.slice(1, 5) || [];
  const imageGrid = news.slice(5, 9) || [];
  const trending = news.slice(0, 2) || [];
  const videoStories = news.slice(3, 5) || [];
  const listNews = news.slice(5, 10) || [];
  const tabNews = news.slice(0, 6) || [];
  const moreNews = news.slice(6, 12) || [];

  return (
    <div className="max-w-[90%] p-2 sm:p-4 mx-auto space-y-4 sm:space-y-6">
      {news.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Technology News Found</h3>
          <p className="text-gray-600 mb-4">Check back later for Technology news updates.</p>
        </div>
      ) : (
        <>
          {/* Main Story with Sidebar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Main Featured Story */}
            <div onClick={() => mainStory.id && navigate(`/news/${mainStory.id}`)} className="lg:col-span-2 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative">
                <img
                  src={getImageUrl(mainStory.image) || '/default.jpg'}
                  alt={mainStory.title}
                  className="w-full h-48 sm:h-64 lg:h-80 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">Technology</span>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                  {mainStory.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  {mainStory.excerpt}
                </p>
                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="mr-4">{mainStory.created_at ? new Date(mainStory.created_at).toLocaleDateString() : 'N/A'}</span>
                  {mainStory.author_name && <span>{mainStory.author_name}</span>}
                </div>
              </div>
            </div>

            {/* Side Stories List */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">Latest Tech News</h3>
              <div className="space-y-4">
                {sideStories.map((story) => (
                  <div key={story.id} onClick={() => story.id && navigate(`/news/${story.id}`)} className="pb-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-2 -m-2 rounded cursor-pointer">
                    <h4 className="font-semibold text-gray-900 mb-2 leading-snug hover:text-blue-600">
                      {story.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="mr-3">{story.created_at ? new Date(story.created_at).toLocaleDateString() : 'N/A'}</span>
                      {story.author_name && <span>{story.author_name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Update Banner */}
          {news.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded mr-3 animate-pulse">LIVE</span>
                  <div>
                    <h3 className="text-lg font-bold">Latest Technology Updates</h3>
                    <p className="text-sm text-blue-100 mt-1">{news.length} articles available</p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Image Grid - 4 Column */}
          {imageGrid.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {imageGrid.map((item) => (
                <div key={item.id} onClick={() => item.id && navigate(`/news/${item.id}`)} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative overflow-hidden">
                    <img
                      src={getImageUrl(item.image) || '/default.jpg'}
                      alt={item.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2 leading-tight group-hover:text-blue-600 line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="mr-2">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                      {item.author_name && <span>{item.author_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trending Section */}
          {trending.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-3 border-b-2 border-blue-600">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Trending Tech</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trending.map((item, index) => (
                  <div key={item.id} onClick={() => item.id && navigate(`/news/${item.id}`)} className="flex items-start space-x-4 cursor-pointer group">
                    <div className="text-3xl font-bold text-gray-300 group-hover:text-blue-600 transition-colors">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2 leading-relaxed line-clamp-2">
                        {item.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{item.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Section */}
          {videoStories.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-600">Video News</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {videoStories.map((video) => (
                  <div key={video.id} onClick={() => video.id && navigate(`/news/${video.id}`)} className="group cursor-pointer">
                    <div className="relative rounded-lg overflow-hidden mb-3">
                      <img
                        src={getImageUrl(video.image) || '/default.jpg'}
                        alt={video.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                        <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        5:30
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                      {video.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{video.views || 0} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compact List View */}
          {listNews.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-600">More News</h3>
              <div className="space-y-3">
                {listNews.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => item.id && navigate(`/news/${item.id}`)}
                    className="flex items-start py-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 -mx-5 px-5 cursor-pointer group"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                        {item.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="mr-3">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                        {item.author_name && <span>{item.author_name}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advertisement Banner 1 */}
          <AdSlot position="hero_banner" className="mb-4" />

          {/* Tab Content Section with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Tab Content - 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200">
                {['latest', 'trending'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-4 font-semibold text-sm ${activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {tab === 'latest' && 'Latest'}
                    {tab === 'trending' && 'Trending'}
                  </button>
                ))}
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {tabNews.map((item) => (
                    <div key={item.id} onClick={() => item.id && navigate(`/news/${item.id}`)} className="flex space-x-4 pb-4 border-b border-gray-200 last:border-0 cursor-pointer group">
                      <img
                        src={getImageUrl(item.image) || '/default.jpg'}
                        alt="News"
                        className="w-28 h-20 object-cover rounded flex-shrink-0 group-hover:opacity-90"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
                          {item.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span className="mr-3">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                          {item.author_name && <span>{item.author_name}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - 1 column */}
            <div className="space-y-4">
              {/* Advertisement Banner - Square */}
              <AdSlot position="sidebar" />

              {/* Most Read Section */}
              {news.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">Most Read</h3>
                  <div className="space-y-3">
                    {news.slice(0, 5).map((item, idx) => (
                      <div key={item.id} onClick={() => item.id && navigate(`/news/${item.id}`)} className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-0 cursor-pointer group">
                        <span className="text-2xl font-bold text-gray-300 group-hover:text-blue-600">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>{item.views || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advertisement Banner - Vertical */}
              <AdSlot position="sidebar" />
            </div>
          </div>

          {/* More News Cards Grid */}
          {moreNews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreNews.map((item, index) => (
                <React.Fragment key={item.id}>
                  <div onClick={() => item.id && navigate(`/news/${item.id}`)} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <img
                      src={getImageUrl(item.image) || '/default.jpg'}
                      alt="News"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="mr-3">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                        {item.author_name && <span>{item.author_name}</span>}
                      </div>
                    </div>
                  </div>
                  {(index + 1) % 4 === 0 && <AdSlot position="infeed" />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Advertisement Banner 2 - Full Width */}
          <AdSlot position="hero_banner" />
        </>
      )}
    </div>
  );
};

export default Technology;
