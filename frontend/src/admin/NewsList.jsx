import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Eye, Plus, Search, CheckSquare, Square, Newspaper, RefreshCw } from 'lucide-react';
import AdminNavbar from './admincomponents/AdminNavbar';
import { getNews, deleteNews } from '../services/adminApi';

// ─── helpers ──────────────────────────────────────────────────────────────────
const STATUS_META = {
  published: { label: 'Published', cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
  draft:     { label: 'Draft',     cls: 'bg-amber-100  text-amber-700  ring-1 ring-amber-200'  },
  archived:  { label: 'Archived',  cls: 'bg-slate-100  text-slate-600  ring-1 ring-slate-200'  },
};

const fmtDate = (s) =>
  new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// ─── component ────────────────────────────────────────────────────────────────
const NewsList = () => {
  const [news,             setNews]             = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [searchTerm,       setSearchTerm]       = useState('');
  const [deleteLoading,    setDeleteLoading]    = useState(null);
  const [selectedNews,     setSelectedNews]     = useState(new Set());
  const [bulkDeleteLoading,setBulkDeleteLoading]= useState(false);
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [filterCategory,   setFilterCategory]   = useState('all');
  const searchRef = useRef(null);

  useEffect(() => { fetchNews(); }, []);

  // ── data ──────────────────────────────────────────────────────────────────
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
      // BUG FIX: getNews returns { data, pagination } — we need .data
      const response = await getNews('?limit=100');
      setNews(Array.isArray(response) ? response : response.data ?? []);
    } catch (err) {
      setError('Failed to fetch news: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── filters ───────────────────────────────────────────────────────────────
  const categories = ['all', ...new Set(news.map(i => i.category_name).filter(Boolean))];

  const filteredNews = news.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      item.title.toLowerCase().includes(q) ||
      (item.category_name ?? '').toLowerCase().includes(q);
    const matchesStatus   = filterStatus   === 'all' || item.status        === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category_name === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const activeFilters = searchTerm || filterStatus !== 'all' || filterCategory !== 'all';
  const clearFilters = () => { setSearchTerm(''); setFilterStatus('all'); setFilterCategory('all'); };

  // ── selection ─────────────────────────────────────────────────────────────
  const allSelected = filteredNews.length > 0 && filteredNews.every(i => selectedNews.has(i.id));

  const toggleSelect = (id) => setSelectedNews(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedNews(new Set());
    } else {
      setSelectedNews(new Set(filteredNews.map(i => i.id)));
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this news article?')) return;
    try {
      setDeleteLoading(id);
      await deleteNews(id);
      setNews(prev => prev.filter(n => n.id !== id));
      setSelectedNews(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedNews.size) return;
    if (!window.confirm(`Delete ${selectedNews.size} article(s)? This cannot be undone.`)) return;
    try {
      setBulkDeleteLoading(true);
      await Promise.all(Array.from(selectedNews).map(id => deleteNews(id)));
      setNews(prev => prev.filter(n => !selectedNews.has(n.id)));
      setSelectedNews(new Set());
    } catch (err) {
      alert('Bulk delete failed: ' + err.message);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#0f1117', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        :root {
          --accent: #6c63ff;
          --accent-dim: rgba(108,99,255,.12);
          --accent-border: rgba(108,99,255,.35);
          --surface: #181c27;
          --surface2: #1f2436;
          --border: rgba(255,255,255,.07);
          --text: #e8eaf0;
          --muted: #7c839e;
          --danger: #f04a5a;
          --success: #34d399;
          --warning: #fbbf24;
        }
        .news-table th { font-family: 'Syne', sans-serif; letter-spacing: .04em; }
        .row-hover { transition: background .15s; }
        .row-hover:hover { background: rgba(108,99,255,.05) !important; }
        .row-selected { background: rgba(108,99,255,.1) !important; }
        .badge { display:inline-flex; align-items:center; padding:2px 10px; border-radius:999px; font-size:11px; font-weight:600; letter-spacing:.03em; }
        .badge-published { background:rgba(52,211,153,.12); color:#34d399; border:1px solid rgba(52,211,153,.25); }
        .badge-draft     { background:rgba(251,191,36,.12);  color:#fbbf24; border:1px solid rgba(251,191,36,.25);  }
        .badge-archived  { background:rgba(124,131,158,.12); color:#7c839e; border:1px solid rgba(124,131,158,.25); }
        .badge-cat       { background:rgba(108,99,255,.15);  color:#a89dff; border:1px solid rgba(108,99,255,.25);  }
        .filter-chip     { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px; background:rgba(108,99,255,.12); color:#a89dff; font-size:12px; border:1px solid var(--accent-border); }
        .filter-chip button { line-height:1; opacity:.7; } .filter-chip button:hover { opacity:1; }
        .ctrl-btn { display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; border:none; }
        .ctrl-btn-primary { background:var(--accent); color:#fff; }
        .ctrl-btn-primary:hover { filter:brightness(1.1); }
        .ctrl-btn-danger  { background:rgba(240,74,90,.15); color:var(--danger); border:1px solid rgba(240,74,90,.3); }
        .ctrl-btn-danger:hover  { background:rgba(240,74,90,.25); }
        .ctrl-btn:disabled { opacity:.5; cursor:not-allowed; }
        .action-btn { display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; border:none; cursor:pointer; transition:all .15s; }
        .action-btn-edit   { background:rgba(99,179,237,.1); color:#63b3ed; }
        .action-btn-edit:hover   { background:rgba(99,179,237,.2); }
        .action-btn-view   { background:rgba(52,211,153,.1); color:#34d399; }
        .action-btn-view:hover   { background:rgba(52,211,153,.2); }
        .action-btn-delete { background:rgba(240,74,90,.1); color:var(--danger); }
        .action-btn-delete:hover { background:rgba(240,74,90,.2); }
        .action-btn:disabled { opacity:.4; cursor:not-allowed; }
        .input-field { background:var(--surface2); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:10px 14px; font-size:13px; transition:border .15s; outline:none; }
        .input-field:focus { border-color:var(--accent-border); box-shadow:0 0 0 3px rgba(108,99,255,.1); }
        .input-field::placeholder { color:var(--muted); }
        .input-field option { background:#1f2436; }
        .thumb { width:48px; height:48px; border-radius:8px; object-fit:cover; background:var(--surface2); flex-shrink:0; }
        .thumb-placeholder { width:48px; height:48px; border-radius:8px; background:var(--surface2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .spin { animation: spin .7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .bulk-bar { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:12px 24px; display:flex; align-items:center; gap:20px; z-index:50; box-shadow:0 8px 40px rgba(0,0,0,.6); backdrop-filter:blur(12px); }
        .cb { width:18px; height:18px; cursor:pointer; accent-color:var(--accent); }
        .truncate-title { max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      `}</style>
      {/* <AdminNavbar /> */}


      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 100px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              News Management
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14 }}>
              {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''}
              {selectedNews.size > 0 && <span style={{ color: 'var(--accent)' }}> · {selectedNews.size} selected</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ctrl-btn" style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }} onClick={fetchNews}>
              <RefreshCw size={15} />
              Refresh
            </button>
            {selectedNews.size > 0 && (
              <button className="ctrl-btn ctrl-btn-danger" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
                {bulkDeleteLoading
                  ? <div className="spin" style={{ width: 15, height: 15, border: '2px solid rgba(240,74,90,.3)', borderTopColor: 'var(--danger)', borderRadius: '50%' }} />
                  : <Trash2 size={15} />
                }
                Delete ({selectedNews.size})
              </button>
            )}
            <a
              href="/admin/news/create"
              className="ctrl-btn ctrl-btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <Plus size={15} />
              Add News
            </a>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 160px', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              className="input-field"
              style={{ width: '100%', paddingLeft: 36, boxSizing: 'border-box' }}
              placeholder="Search by title or category…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select className="input-field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* ── Active filter chips ── */}
        {activeFilters && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Filters:</span>
            {searchTerm && <span className="filter-chip">Search: {searchTerm}<button onClick={() => setSearchTerm('')}>×</button></span>}
            {filterStatus !== 'all' && <span className="filter-chip">Status: {filterStatus}<button onClick={() => setFilterStatus('all')}>×</button></span>}
            {filterCategory !== 'all' && <span className="filter-chip">Category: {filterCategory}<button onClick={() => setFilterCategory('all')}>×</button></span>}
            <button onClick={clearFilters} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ background: 'rgba(240,74,90,.1)', border: '1px solid rgba(240,74,90,.3)', color: '#f8a5ad', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* ── Table ── */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
              <div className="spin" style={{ width: 36, height: 36, border: '3px solid rgba(108,99,255,.2)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading news…</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
              <Newspaper size={40} color="var(--muted)" strokeWidth={1.2} />
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>No articles found</p>
              {activeFilters && (
                <button onClick={clearFilters} style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="news-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--muted)', fontSize: 11, fontWeight: 600, width: 40 }}>
                      <input
                        type="checkbox"
                        className="cb"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    {['Image', 'Title', 'Category', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.map((article) => {
                    const isSelected = selectedNews.has(article.id);
                    const statusMeta = STATUS_META[article.status] ?? STATUS_META.archived;
                    return (
                      <tr
                        key={article.id}
                        className={`row-hover ${isSelected ? 'row-selected' : ''}`}
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '12px 16px' }}>
                          <input
                            type="checkbox"
                            className="cb"
                            checked={isSelected}
                            onChange={() => toggleSelect(article.id)}
                          />
                        </td>

                        {/* Thumbnail - BUG FIX: was article.image, now mapped via alias in SQL */}
                        <td style={{ padding: '12px 16px' }}>
                          {article.image ? (
                            <img
                              src={article.image}
                              alt=""
                              className="thumb"
                              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div className="thumb-placeholder" style={{ display: article.image ? 'none' : 'flex' }}>
                            <Newspaper size={18} color="var(--muted)" strokeWidth={1.2} />
                          </div>
                        </td>

                        {/* Title */}
                        <td style={{ padding: '12px 16px' }}>
                          <div className="truncate-title" style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>
                            {article.title}
                          </div>
                          <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>/{article.slug}</div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '12px 16px' }}>
                          <span className="badge badge-cat">{article.category_name || 'Uncategorized'}</span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge badge-${article.status ?? 'archived'}`}>
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Views */}
                        <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13 }}>
                          {(article.views || 0).toLocaleString()}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                          {fmtDate(article.created_at)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <a href={`/admin/news/${article.id}`} className="action-btn action-btn-edit" title="Edit">
                              ✏️
                            </a>
                            <a href={`/news/${article.id}`} target="_blank" rel="noopener noreferrer" className="action-btn action-btn-view" title="View">
                              <Eye size={15} />
                            </a>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => handleDelete(article.id)}
                              disabled={deleteLoading === article.id}
                              title="Delete"
                            >
                              {deleteLoading === article.id
                                ? <div className="spin" style={{ width: 14, height: 14, border: '2px solid rgba(240,74,90,.3)', borderTopColor: 'var(--danger)', borderRadius: '50%' }} />
                                : <Trash2 size={15} />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selectedNews.size > 0 && (
        <div className="bulk-bar">
          <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>
            {selectedNews.size} selected
          </span>
          <button
            onClick={() => setSelectedNews(new Set())}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}
          >
            Deselect
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <button className="ctrl-btn ctrl-btn-danger" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
            {bulkDeleteLoading
              ? <div className="spin" style={{ width: 14, height: 14, border: '2px solid rgba(240,74,90,.3)', borderTopColor: 'var(--danger)', borderRadius: '50%' }} />
              : <Trash2 size={14} />
            }
            Delete All
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsList;