import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageCircle, Share2, Facebook, Twitter, Bookmark, ChevronRight, TrendingUp, ChevronLeft, Image as ImageIcon, Copy } from 'lucide-react';
import { getImageUrl, getNews } from '../services/adminApi';
import AdSlot from '../components/ads/AdSlot';

export default function OnlineKhabarNewsDetail() {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments] = useState([
    { id: 1, author: 'राम शर्मा', time: '१ घण्टा अगाडि', text: 'यो घटना निकै दुखद छ।' },
    { id: 2, author: 'सीता गुरुङ', time: '३० मिनेट अगाडि', text: 'सरकारले तुरुन्त कारबाही गर्नुपर्छ।' }
  ]);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Fetch news data
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        // Fetch the specific news item
        const newsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/${id}`);
        if (!newsResponse.ok) throw new Error('News not found');
        const news = await newsResponse.json();
        setNewsItem(news);

        // Fetch all news for related news and trending
        const allNewsResponse = await getNews({ limit: 50, status: 'published' });
        const allNews = Array.isArray(allNewsResponse) ? allNewsResponse : (allNewsResponse?.data || []);

        // Get related news (same category, exclude current)
        const related = allNews
          .filter(n => n.id !== parseInt(id) && n.category_id === news.category_id)
          .slice(0, 3);
        setRelatedNews(related);

        // Get trending (most viewed)
        const trending = allNews
          .slice(0, 5);
        setTrendingNews(trending);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNewsData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">समाचार लोड हो रहेको छ...</div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">समाचार खोजी गर्न सकिएन</div>
      </div>
    );
  }

  // Gallery images - use news image + fallback
  const galleryImages = newsItem.image 
    ? [getImageUrl(newsItem.image)]
    : [];
  
  const openGallery = (idx) => { setGalleryIndex(idx); setGalleryOpen(true); };
  const prevImg = () => setGalleryIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  const nextImg = () => setGalleryIndex((i) => (i + 1) % galleryImages.length);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen w-full bg-gray-50">


      <div className="max-w-[90%] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <a href="/" className="hover:text-red-600">गृहपृष्ठ</a>
              <ChevronRight className="w-4 h-4 mx-2" />
              <a href="/news" className="hover:text-red-600">समाचार</a>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-gray-800">{newsItem?.category_name || 'समाचार'}</span>
            </div>

            {/* Article Card */}
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Title */}
              <div className="p-6 pb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {newsItem?.title}
                </h1>

                {/* Meta Info */}
                <div className="flex items-center text-sm text-gray-600 space-x-4 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{newsItem?.published_at ? new Date(newsItem.published_at).toLocaleDateString('ne-NP') : new Date().toLocaleDateString('ne-NP')}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>{comments.length} प्रतिक्रिया</span>
                  </div>
                  {newsItem?.author_name && (
                    <div className="flex items-center">
                      <span>द्वारा {newsItem.author_name}</span>
                    </div>
                  )}
                </div>

                {/* Share Buttons */}
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    <Facebook className="w-4 h-4" />
                    <span>शेयर</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1.5 bg-sky-500 text-white rounded hover:bg-sky-600 text-sm">
                    <Twitter className="w-4 h-4" />
                    <span>ट्वीट</span>
                  </button>
                  <button className="p-1.5 text-gray-600 hover:text-red-600 border border-gray-300 rounded">
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-600 hover:text-red-600 border border-gray-300 rounded">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Featured Image */}
              <div className="px-6">
                {newsItem?.image && (
                  <>
                    <img
                      src={getImageUrl(newsItem.image)}
                      alt={newsItem.title}
                      className="w-full h-96 object-cover rounded-lg cursor-pointer hover:opacity-90"
                      onClick={() => openGallery(0)}
                    />
                    <p className="text-sm text-gray-500 mt-2">{newsItem.title}</p>
                  </>
                )}
              </div>

              <AdSlot position="news_detail_top" className="my-6" />

              {/* Article Content */}
              <div className="p-6 prose max-w-none">
                {newsItem?.excerpt && (
                  <p className="text-lg leading-relaxed mb-4 font-medium">
                    {newsItem.excerpt}
                  </p>
                )}

                <div className="text-base leading-relaxed mb-4 whitespace-pre-wrap">
                  {newsItem?.content}
                </div>
              </div>

              <AdSlot position="news_detail_middle" />

              {/* Tags */}
              <div className="px-6 pb-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">तारकेश्वर</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">आगजनी</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">प्रदर्शन</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">जेनजी</span>
                </div>
              </div>

              <AdSlot position="news_detail_bottom" className="my-6" />

              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-5 h-5 text-red-600" />
                  <h3 className="text-xl font-bold">तस्बिर ग्यालरी</h3>
                </div>
                {galleryImages.length > 0 ? (
                  <div className="columns-2 md:columns-3 gap-3">
                    {galleryImages.map((img, idx) => (
                      <button key={idx} onClick={() => openGallery(idx)} className="group mb-3 break-inside-avoid rounded-lg overflow-hidden border border-gray-200">
                        <img src={img} alt={`gallery-${idx}`} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">कोई चित्र उपलब्ध नहीं</p>
                )}
              </div>

              {/* Comments Section */}
              <div className="px-6 pb-6 border-t pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-red-600" />
                  प्रतिक्रियाहरू ({comments.length})
                </h3>

                <div className="space-y-4 mb-6">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">{comment.author}</span>
                        <span className="text-sm text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    placeholder="तपाईंको प्रतिक्रिया लेख्नुहोस्..."
                  ></textarea>
                  <button className="mt-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    पठाउनुहोस्
                  </button>
                </div>
              </div>
            </article>

            {/* Related News */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">सम्बन्धित समाचार</h3>
              {relatedNews.length > 0 ? (
                <div className="space-y-4">
                  {relatedNews.map((news, idx) => (
                    <Link to={`/news/${news.id}`} key={idx} className="flex gap-4 pb-4 border-b last:border-0 hover:opacity-70 transition">
                      {news.image && (
                        <img
                          src={getImageUrl(news.image)}
                          alt={news.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 hover:text-red-600 mb-2 line-clamp-2">
                          {news.title}
                        </h4>
                        {news.published_at && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{new Date(news.published_at).toLocaleDateString('ne-NP')}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">कोई सम्बन्धित समाचार नहीं</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Trending Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6  top-20">
              <h3 className="text-xl font-bold mb-4 flex items-center border-b pb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                ट्रेन्डिङ
              </h3>
              {trendingNews.length > 0 ? (
                <div className="space-y-3">
                  {trendingNews.map((news, idx) => (
                    <Link to={`/news/${news.id}`} key={idx} className="pb-3 border-b last:border-0 hover:opacity-70 transition block">
                      <span className="text-xs text-red-600 font-semibold">{news.category_name || 'समाचार'}</span>
                      <h4 className="font-semibold text-gray-800 hover:text-red-600 cursor-pointer mt-1 line-clamp-2">
                        {news.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">कोई ट्रेन्डिङ समाचार नहीं</p>
              )}
            </div>

            {/* Ad Space */}
            <AdSlot position="sidebar" />


            {/* Share Box */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">समाचार शेयर</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank')} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </button>
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`, '_blank')} className="flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 text-sm">
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(currentUrl); }} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Latest News */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">ताजा समाचार</h3>
              {trendingNews.length > 0 ? (
                <div className="space-y-3 text-sm">
                  {trendingNews.map(news => (
                    <Link to={`/news/${news.id}`} key={news.id} className="pb-3 border-b last:border-0 hover:text-red-600 transition">
                      <p className="text-gray-800 hover:text-red-600 cursor-pointer line-clamp-2">
                        {news.title}
                      </p>
                      {news.published_at && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{new Date(news.published_at).toLocaleDateString('ne-NP')}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">कोई समाचार उपलब्ध नहीं</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">सिफारिस गरिएको समाचार</h3>
              {relatedNews.length > 0 ? (
                <div className="space-y-4">
                  {relatedNews.map((news, idx) => (
                    <Link to={`/news/${news.id}`} key={`rec-${idx}`} className="flex gap-4 pb-4 border-b last:border-0 hover:opacity-70 transition">
                      {news.image && (
                        <img src={getImageUrl(news.image)} alt={news.title} className="w-20 h-20 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug hover:text-red-600 cursor-pointer line-clamp-2">{news.title}</p>
                        {news.published_at && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{new Date(news.published_at).toLocaleDateString('ne-NP')}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">कोई सिफारिस गरिएको समाचार नहीं</p>
              )}
            </div>
            {/* another advertisement */}
            <AdSlot position="sidebar" />
          </div>
        </div>
      </div>

      <div className={`${galleryOpen ? 'flex' : 'hidden'} fixed inset-0 bg-black/80 z-50 items-center justify-center`} onClick={() => setGalleryOpen(false)}>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <img src={galleryImages[galleryIndex]} alt="modal" className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl" />
          <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow">
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>

    </div>
  );
}
