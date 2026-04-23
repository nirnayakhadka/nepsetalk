import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Newspaper, Tag, BarChart3, Bell, BookOpen, Plus } from 'lucide-react';

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({ news: true, blogs: true, categories: true, videos: true, ads: true });

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const toggleSection = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="admin-sidebar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        .admin-sidebar * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .admin-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 260px; background: #ffffff; border-right: 1px solid #e5e7eb; box-shadow: 2px 0 18px rgba(15,23,42,.08); overflow-y: auto; z-index: 1000; }
        .admin-sidebar .logo { display: flex; align-items: center; gap: 10px; padding: 16px 18px; border-bottom: 1px solid #e5e7eb; text-decoration: none; color: #0f172a; }
        .admin-sidebar .logo-icon { width: 42px; height: 42px; border-radius: 10px; background: linear-gradient(135deg,#7c3aed,#db2777); display: flex; align-items: center; justify-content: center; }
        .admin-sidebar .logo-text { font-size: 16px; font-weight: 800; margin: 0; color: #0f172a; }
        .admin-sidebar .small-text { margin: 0; font-size: 12px; color: #64748b; letter-spacing: .04em; }
        .admin-sidebar .user-box { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .admin-sidebar .avatar-circle { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg,#7c3aed,#db2777); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
        .admin-sidebar .menu { padding: 12px 0; }
        .admin-sidebar .menu-heading { font-size: 12px; text-transform: uppercase; color: #94a3b8; padding: 10px 16px 6px; letter-spacing: .07em; }
        .admin-sidebar .item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 16px; border: none; background: transparent; color: #334155; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px; cursor: pointer; transition: all .15s; }
        .admin-sidebar .item:hover { background: #f1f5f9; color: #0f172a; }
        .admin-sidebar .item.active { background: #eef2ff; color: #4f46e5; }
        .admin-sidebar .submenu { display: flex; flex-direction: column; padding-left: 16px; }
        .admin-sidebar .subitem { display: block; font-size: 13px; color: #475569; text-decoration: none; padding: 7px 16px; border-radius: 8px; margin: 2px 0; transition: all .15s; }
        .admin-sidebar .subitem:hover { background: #f8fafc; color: #0f172a; }
        .admin-sidebar .subitem.active { font-weight: 700; color: #0f172a; }
        .admin-sidebar .footer { margin-top: auto; padding: 14px 16px; border-top: 1px solid #e5e7eb; }
        .admin-sidebar .logout-btn { width: 100%; padding: 11px 14px; background: #ef4444; border: none; color: #fff; font-weight: 700; border-radius: 10px; cursor: pointer; }
        .admin-sidebar .logout-btn:hover { filter: brightness(1.03); }
        .admin-sidebar .toggle-icon { margin-left: auto; transform: rotate(0deg); transition: transform .2s; }
        .admin-sidebar .toggle-icon.expanded { transform: rotate(180deg); }
      `}</style>

      <Link to="/admin/dashboard" className="logo">
        <div className="logo-icon"><Newspaper size={18} color="#fff" /></div>
        <div>
          <p className="logo-text">NepseTalk</p>
          <p className="small-text">Admin Panel</p>
        </div>
      </Link>

      <div className="user-box">
        <div className="avatar-circle">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
        <div>
          <p style={{ margin: 0, fontWeight: 700 }}>{user?.name || 'Administrator'}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Admin</p>
        </div>
      </div>

      <div className="menu">
        <div className="menu-heading">Navigation</div>

        <Link to="/admin/dashboard" className={`item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <button className={`item ${isActive('/admin/news') ? 'active' : ''}`} onClick={() => toggleSection('news')}>
          <Newspaper size={16} />
          News
          <span className={`toggle-icon ${expanded.news ? 'expanded' : ''}`}>▾</span>
        </button>
        {expanded.news && (
          <div className="submenu">
            <Link to="/admin/news" className={`subitem ${isActive('/admin/news') && !isActive('/admin/news/create') ? 'active' : ''}`}>View All News</Link>
            <Link to="/admin/news/create" className={`subitem ${isActive('/admin/news/create') ? 'active' : ''}`}>Create New News</Link>
          </div>
        )}

        <button className={`item ${isActive('/admin/blogs') ? 'active' : ''}`} onClick={() => toggleSection('blogs')}>
          <BookOpen size={16} />
          Blogs
          <span className={`toggle-icon ${expanded.blogs ? 'expanded' : ''}`}>▾</span>
        </button>
        {expanded.blogs && (
          <div className="submenu">
            <Link to="/admin/blogs" className={`subitem ${isActive('/admin/blogs') && !isActive('/admin/blogs/create') ? 'active' : ''}`}>View All Blogs</Link>
            <Link to="/admin/blogs/create" className={`subitem ${isActive('/admin/blogs/create') ? 'active' : ''}`}>Create New Blog</Link>
          </div>
        )}

        <button className={`item ${isActive('/admin/categories') ? 'active' : ''}`} onClick={() => toggleSection('categories')}>
          <Tag size={16} />
          Categories
          <span className={`toggle-icon ${expanded.categories ? 'expanded' : ''}`}>▾</span>
        </button>
        {expanded.categories && (
          <div className="submenu">
            <Link to="/admin/categories" className={`subitem ${isActive('/admin/categories') ? 'active' : ''}`}>View Categories</Link>
          </div>
        )}

        <button className={`item ${isActive('/admin/videos') ? 'active' : ''}`} onClick={() => toggleSection('videos')}>
          <BarChart3 size={16} />
          Videos
          <span className={`toggle-icon ${expanded.videos ? 'expanded' : ''}`}>▾</span>
        </button>
        {expanded.videos && (
          <div className="submenu">
            <Link to="/admin/videos" className={`subitem ${isActive('/admin/videos') && !isActive('/admin/videos/create') ? 'active' : ''}`}>View All Videos</Link>
            <Link to="/admin/videos/create" className={`subitem ${isActive('/admin/videos/create') ? 'active' : ''}`}>Create New Video</Link>
          </div>
        )}

        <button className={`item ${isActive('/admin/ads') ? 'active' : ''}`} onClick={() => toggleSection('ads')}>
          <Bell size={16} />
          Ads
          <span className={`toggle-icon ${expanded.ads ? 'expanded' : ''}`}>▾</span>
        </button>
        {expanded.ads && (
          <div className="submenu">
            <Link to="/admin/ads" className={`subitem ${isActive('/admin/ads') && !isActive('/admin/ads/create') ? 'active' : ''}`}>View All Ads</Link>
            <Link to="/admin/ads/create" className={`subitem ${isActive('/admin/ads/create') ? 'active' : ''}`}>Create New Ad</Link>
          </div>
        )}
      </div>

      <div className="footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={14} style={{ marginRight: 6 }} /> Log Out
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar;