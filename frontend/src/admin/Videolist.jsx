import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Plus, Search, RefreshCw, Video, Play } from 'lucide-react';
import { getAllVideos, deleteVideo, getImageUrl } from '../services/adminApi';

const fmtDate = (s) =>
  new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const VideoList = () => {
  const [videos,           setVideos]           = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [searchTerm,       setSearchTerm]       = useState('');
  const [deleteLoading,    setDeleteLoading]    = useState(null);
  const [selectedVideos,   setSelectedVideos]   = useState(new Set());
  const [bulkDeleteLoading,setBulkDeleteLoading]= useState(false);
  const [filterSection,    setFilterSection]    = useState('all');
  const [filterStatus,     setFilterStatus]     = useState('all');

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true); setError('');
      const response = await getAllVideos({ limit: 100 });
      setVideos(Array.isArray(response) ? response : response.data ?? []);
    } catch (err) {
      setError('Failed to fetch videos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = videos.filter(v => {
    const q = searchTerm.toLowerCase();
    const matchSearch  = !q || v.title.toLowerCase().includes(q) || (v.category ?? '').toLowerCase().includes(q);
    const matchSection = filterSection === 'all' || v.section === filterSection;
    const matchStatus  = filterStatus  === 'all' || v.status  === filterStatus;
    return matchSearch && matchSection && matchStatus;
  });

  const activeFilters = searchTerm || filterSection !== 'all' || filterStatus !== 'all';
  const clearFilters  = () => { setSearchTerm(''); setFilterSection('all'); setFilterStatus('all'); };

  const allSelected  = filtered.length > 0 && filtered.every(v => selectedVideos.has(v.id));
  const toggleSelect = (id) => setSelectedVideos(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll    = () => allSelected ? setSelectedVideos(new Set()) : setSelectedVideos(new Set(filtered.map(v => v.id)));

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      setDeleteLoading(id);
      await deleteVideo(id);
      setVideos(prev => prev.filter(v => v.id !== id));
      setSelectedVideos(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err) { alert('Failed to delete: ' + err.message); }
    finally { setDeleteLoading(null); }
  };

  const handleBulkDelete = async () => {
    if (!selectedVideos.size) return;
    if (!window.confirm(`Delete ${selectedVideos.size} video(s)?`)) return;
    try {
      setBulkDeleteLoading(true);
      await Promise.all(Array.from(selectedVideos).map(id => deleteVideo(id)));
      setVideos(prev => prev.filter(v => !selectedVideos.has(v.id)));
      setSelectedVideos(new Set());
    } catch (err) { alert('Bulk delete failed: ' + err.message); }
    finally { setBulkDeleteLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .vid-table th { font-family:'Syne',sans-serif; letter-spacing:.04em; }
        .row-h:hover { background:rgba(99,102,241,.06) !important; }
        .row-sel { background:rgba(99,102,241,.12) !important; }
        .badge { display:inline-flex; align-items:center; padding:2px 10px; border-radius:999px; font-size:11px; font-weight:600; }
        .badge-main   { background:rgba(99,102,241,.15); color:#a5b4fc; border:1px solid rgba(99,102,241,.3); }
        .badge-upnext { background:rgba(251,191,36,.12);  color:#fbbf24; border:1px solid rgba(251,191,36,.3); }
        .badge-active   { background:rgba(52,211,153,.12); color:#34d399; border:1px solid rgba(52,211,153,.25); }
        .badge-inactive { background:rgba(124,131,158,.12); color:#7c839e; border:1px solid rgba(124,131,158,.25); }
        .inp { background:#1e2130; border:1px solid rgba(255,255,255,.08); color:#e8eaf0; border-radius:10px; padding:10px 14px; font-size:13px; outline:none; transition:border .15s; }
        .inp:focus { border-color:rgba(99,102,241,.5); box-shadow:0 0 0 3px rgba(99,102,241,.1); }
        .inp::placeholder { color:#7c839e; }
        .inp option { background:#1e2130; }
        .cbtn { display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; border:none; }
        .cbtn-primary { background:#6366f1; color:#fff; }
        .cbtn-primary:hover { filter:brightness(1.1); }
        .cbtn-danger { background:rgba(240,74,90,.15); color:#f04a5a; border:1px solid rgba(240,74,90,.3); }
        .cbtn-danger:hover { background:rgba(240,74,90,.25); }
        .cbtn:disabled { opacity:.5; cursor:not-allowed; }
        .abtn { display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; border:none; cursor:pointer; transition:all .15s; }
        .abtn-edit   { background:rgba(99,179,237,.1); color:#63b3ed; }
        .abtn-edit:hover { background:rgba(99,179,237,.2); }
        .abtn-del    { background:rgba(240,74,90,.1);  color:#f04a5a; }
        .abtn-del:hover { background:rgba(240,74,90,.2); }
        .abtn:disabled { opacity:.4; cursor:not-allowed; }
        .chip { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px; background:rgba(99,102,241,.12); color:#a5b4fc; font-size:12px; border:1px solid rgba(99,102,241,.3); }
        .spin { animation:spin .7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .thumb { width:72px; height:48px; border-radius:8px; object-fit:cover; background:#1e2130; flex-shrink:0; }
        .thumb-ph { width:72px; height:48px; border-radius:8px; background:#1e2130; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .bulk-bar { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#1e2130; border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:12px 24px; display:flex; align-items:center; gap:20px; z-index:50; box-shadow:0 8px 40px rgba(0,0,0,.6); backdrop-filter:blur(12px); }
        .cb { width:18px; height:18px; cursor:pointer; accent-color:#6366f1; }
        .trunc { max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 100px' }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800 }}>Video Management</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {filtered.length} video{filtered.length !== 1 ? 's' : ''}
              {selectedVideos.size > 0 && <span className="text-indigo-400"> · {selectedVideos.size} selected</span>}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="cbtn" style={{ background: '#1e2130', color: '#7c839e', border: '1px solid rgba(255,255,255,.08)' }} onClick={fetchVideos}>
              <RefreshCw size={15} /> Refresh
            </button>
            {selectedVideos.size > 0 && (
              <button className="cbtn cbtn-danger" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
                {bulkDeleteLoading ? <div className="spin" style={{ width:15,height:15,border:'2px solid rgba(240,74,90,.3)',borderTopColor:'#f04a5a',borderRadius:'50%' }}/> : <Trash2 size={15} />}
                Delete ({selectedVideos.size})
              </button>
            )}
            <a href="/admin/videos/create" className="cbtn cbtn-primary" style={{ textDecoration: 'none' }}>
              <Plus size={15} /> Add Video
            </a>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 160px', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#7c839e',pointerEvents:'none' }} />
            <input className="inp" style={{ width:'100%',paddingLeft:36,boxSizing:'border-box' }} placeholder="Search by title or category…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="inp" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
            <option value="all">All Sections</option>
            <option value="main">Main</option>
            <option value="upnext">Up Next</option>
          </select>
          <select className="inp" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Filter chips */}
        {activeFilters && (
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <span className="text-slate-400 text-xs">Filters:</span>
            {searchTerm       && <span className="chip">Search: {searchTerm}<button onClick={() => setSearchTerm('')} className="opacity-70 hover:opacity-100">×</button></span>}
            {filterSection !== 'all' && <span className="chip">Section: {filterSection}<button onClick={() => setFilterSection('all')} className="opacity-70 hover:opacity-100">×</button></span>}
            {filterStatus  !== 'all' && <span className="chip">Status: {filterStatus}<button onClick={() => setFilterStatus('all')} className="opacity-70 hover:opacity-100">×</button></span>}
            <button onClick={clearFilters} className="text-indigo-400 text-xs bg-transparent border-none cursor-pointer">Clear all</button>
          </div>
        )}

        {/* Error */}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-5 text-sm">{error}</div>}

        {/* Table */}
        <div style={{ background: '#181c27', borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="spin" style={{ width:36,height:36,border:'3px solid rgba(99,102,241,.2)',borderTopColor:'#6366f1',borderRadius:'50%' }} />
              <p className="text-slate-400 text-sm">Loading videos…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Video size={40} color="#7c839e" strokeWidth={1.2} />
              <p className="text-slate-400 text-sm">No videos found</p>
              {activeFilters && <button onClick={clearFilters} className="text-indigo-400 text-sm bg-transparent border-none cursor-pointer">Clear filters</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="vid-table w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                    <th style={{ padding:'14px 16px', width:40 }}>
                      <input type="checkbox" className="cb" checked={allSelected} onChange={toggleAll} />
                    </th>
                    {['Thumbnail','Title','Category','Section','Status','Duration','Views','Date','Actions'].map(h => (
                      <th key={h} style={{ padding:'14px 16px', textAlign:'left', color:'#7c839e', fontSize:11, fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(video => {
                    const isSel = selectedVideos.has(video.id);
                    return (
                      <tr key={video.id} className={`row-h${isSel ? ' row-sel' : ''}`} style={{ borderTop:'1px solid rgba(255,255,255,.07)' }}>
                        <td style={{ padding:'12px 16px' }}>
                          <input type="checkbox" className="cb" checked={isSel} onChange={() => toggleSelect(video.id)} />
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          {getImageUrl(video.thumbnail) ? (
                            <div style={{ position:'relative' }}>
                              <img src={getImageUrl(video.thumbnail)} alt="" className="thumb" onError={e => e.target.style.display='none'} />
                              <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
                                <Play size={16} color="#fff" fill="#fff" opacity={0.8} />
                              </div>
                            </div>
                          ) : (
                            <div className="thumb-ph"><Play size={18} color="#7c839e" /></div>
                          )}
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div className="trunc" style={{ color:'#e8eaf0', fontSize:13, fontWeight:500 }}>{video.title}</div>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ color:'#94a3b8', fontSize:13 }}>{video.category || '—'}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span className={`badge badge-${video.section}`}>{video.section === 'upnext' ? 'Up Next' : 'Main'}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span className={`badge badge-${video.status}`}>{video.status === 'active' ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td style={{ padding:'12px 16px', color:'#7c839e', fontSize:13 }}>{video.duration || '—'}</td>
                        <td style={{ padding:'12px 16px', color:'#7c839e', fontSize:13 }}>{(video.views||0).toLocaleString()}</td>
                        <td style={{ padding:'12px 16px', color:'#7c839e', fontSize:13, whiteSpace:'nowrap' }}>{fmtDate(video.created_at)}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <div className="flex gap-2">
                            <a href={`/admin/videos/${video.id}`} className="abtn abtn-edit" title="Edit">✏️</a>
                            <button className="abtn abtn-del" onClick={() => handleDelete(video.id)} disabled={deleteLoading === video.id} title="Delete">
                              {deleteLoading === video.id
                                ? <div className="spin" style={{ width:14,height:14,border:'2px solid rgba(240,74,90,.3)',borderTopColor:'#f04a5a',borderRadius:'50%' }}/>
                                : <Trash2 size={15} />}
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

      {/* Bulk bar */}
      {selectedVideos.size > 0 && (
        <div className="bulk-bar">
          <span style={{ color:'#e8eaf0', fontSize:13, fontWeight:500 }}>{selectedVideos.size} selected</span>
          <button onClick={() => setSelectedVideos(new Set())} style={{ background:'none',border:'none',color:'#7c839e',fontSize:13,cursor:'pointer' }}>Deselect</button>
          <div style={{ width:1,height:20,background:'rgba(255,255,255,.08)' }} />
          <button className="cbtn cbtn-danger" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
            {bulkDeleteLoading ? <div className="spin" style={{ width:14,height:14,border:'2px solid rgba(240,74,90,.3)',borderTopColor:'#f04a5a',borderRadius:'50%' }}/> : <Trash2 size={14} />}
            Delete All
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoList;