import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNews, getCategories } from '../services/adminApi';
import { LayoutDashboard, Newspaper, BarChart3, TrendingUp, Users, FileText, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [newsData, categoriesData] = await Promise.all([
        getNews('?limit=100'),
        getCategories()
      ]);

      // Calculate statistics
      const publishedCount = newsData.filter(n => n.status === 'published').length;
      const draftCount = newsData.filter(n => n.status === 'draft').length;
      const totalViews = newsData.reduce((sum, n) => sum + (n.views || 0), 0);
      const avgViews = newsData.length > 0 ? Math.round(totalViews / newsData.length) : 0;

      setNews(newsData);
      setCategories(categoriesData);
      setStats({
        totalNews: newsData.length,
        published: publishedCount,
        drafts: draftCount,
        totalViews: totalViews,
        categories: categoriesData.length || 0,
        avgViews: avgViews,
        publishedChange: 15,
        viewsChange: 23
      });
    } catch (err) {
      setError('डेटा लोड गर्न विफल: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-500/20 border border-${color}-500/30}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value || 0}</p>
        <p className="text-slate-300 font-semibold">{title}</p>
        {change !== undefined && (
          <p className={`text-sm font-bold mt-2 flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this week
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-lg">Loading Dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <StatCard 
            icon={Newspaper} 
            title="Total News" 
            value={stats.totalNews} 
            color="purple"
          />
          <StatCard 
            icon={FileText} 
            title="Published" 
            value={stats.published} 
            change={stats.publishedChange}
            color="green"
          />
          <StatCard 
            icon={Clock} 
            title="Drafts" 
            value={stats.drafts} 
            color="yellow"
          />
          <StatCard 
            icon={Eye} 
            title="Total Views" 
            value={stats.totalViews?.toLocaleString()} 
            change={stats.viewsChange}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent News */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 bg-purple-500/20 p-2 rounded-2xl text-purple-300" />
              <div>
                <h2 className="text-2xl font-bold text-white">ताजा समाचार</h2>
                <p className="text-slate-400">सबैभन्दा नयाँ 5 समाचार</p>
              </div>
              <Link to="/admin/news" className="ml-auto text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                सबै हेर्नुहोस् <span>→</span>
              </Link>
            </div>
            <div className="space-y-4">
              {news.slice(0, 5).map((article, idx) => (
                <Link key={article.id} to={`/admin/news/${article.id}`} className="flex gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate group-hover:text-purple-300 max-w-sm">{article.title}</p>
                    <p className="text-slate-400 text-sm truncate">{article.category_name || 'समाचार'} • {new Date(article.created_at).toLocaleDateString('ne')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{(article.views || 0).toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">views</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <LayoutDashboard className="w-7 h-7" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/admin/news/create" className="w-full block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  ➕ New Article
                </Link>
                <Link to="/admin/categories" className="w-full block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  🏷️ Manage Categories
                </Link>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6">Platform Stats</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Categories</span>
                  <span className="font-bold text-white">{stats.categories || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Views/Article</span>
                  <span className="font-bold text-white">{stats.avgViews || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;

