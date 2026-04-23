import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Globe, Bell } from 'lucide-react';
import AdSlot from '../ads/AdSlot';
import { getNews } from '../../services/adminApi';

const News = () => {
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                // Try stock category first, fallback to general news
                let data = await getNews('?limit=10&category=stock');
                if (!data || data.length === 0) {
                    data = await getNews('?limit=10');
                }
                setNewsData(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('News fetch failed:', err);
                setError('Failed to load news');
                // Fallback trending topics
                setNewsData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto py-20 flex justify-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-4 mx-auto"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded mx-auto" style={{width: '80%'}}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        Latest Market News
                        {error && (
                            <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded ml-auto">
                                Limited data
                            </span>
                        )}
                    </h2>

                    {newsData.length > 0 ? (
                        newsData.map((news, index) => (
                            <div key={news.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-48">
                                    <div className="md:col-span-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                        {news.image ? (
                                            <img 
                                                src={news.image} 
                                                alt={news.title} 
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                                                <TrendingUp className="w-12 h-12 text-blue-400 opacity-50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-2 p-6 flex flex-col">
                                        <div className="flex items-center space-x-2 mb-3 flex-wrap gap-1">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                news.category === 'Market News' ? 'bg-green-100 text-green-800' :
                                                news.category === 'IPO' ? 'bg-blue-100 text-blue-800' :
                                                news.category === 'Analysis' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {news.category_name || news.category || 'News'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                                                {news.created_at ? new Date(news.created_at).toLocaleDateString('ne') : 'Recent'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight hover:text-blue-600 cursor-pointer transition-colors">
                                            {news.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-2">
                                            {news.excerpt || news.content?.substring(0, 120) + '...'}
                                        </p>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <Globe className="w-3 h-3 mr-1" />
                                                {news.source || 'Sharesansar'}
                                            </span>
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center hover:underline">
                                                Read More <span className="ml-1">→</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : !error ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-2xl p-16 text-center">
                            <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No market news at the moment</h3>
                            <p className="text-gray-600 mb-4 max-w-md mx-auto">
                                Latest financial news and market updates will appear here.
                            </p>
                        </div>
                    ) : (
                        Array.from({length: 3}).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-48 mb-6"></div>
                            </div>
                        ))
                    )}

                    {(newsData.length > 0 && newsData.length % 3 === 0) && <AdSlot position="infeed" />}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 sticky top-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                            Trending Topics
                        </h3>
                        <div className="space-y-3">
                            {[
                                'NEPSE index hits new high',
                                'Bank Q3 results strong', 
                                'Hydropower IPO calendar',
                                'Foreign investment trends',
                                'Technical analysis update'
                            ].map((topic, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                                    <span className="text-sm text-gray-700 group-hover:text-orange-600 font-medium truncate">{topic}</span>
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                                        {12 - idx * 2} stories
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                            <Bell className="w-5 h-5 text-blue-600 mr-2" />
                            Live News Alerts
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Get instant notifications for market-moving news, IPO announcements, and index alerts.
                        </p>
                        <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                            Enable Alerts
                        </button>
                    </div>
                </div>
            </div>

            {/* Live indicator */}
            {!loading && (
                <div className="text-center mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500 space-y-1">
                    <p>🟢 Live updates {newsData.length > 0 ? `• ${newsData.length} stories` : ''}</p>
                    <p className="text-xs">Refreshed {new Date().toLocaleTimeString()}</p>
                </div>
            )}
        </div>
    );
};

export default News;

