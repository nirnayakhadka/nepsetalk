import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Search, RefreshCw, BarChart2, Eye, MousePointer, TrendingUp } from 'lucide-react';
import AdminNavbar from './admincomponents/AdminNavbar';
import { getAllAds, deleteAd, getImageUrl } from '../services/adminApi';

const POSITION_LABELS = {
  navbar:               'Navbar',
  hero_banner:          'Hero Banner',
  sidebar:              'Sidebar',
  infeed:               'In-Feed',
  popup:                'Popup',
  news_detail_top:      'News Top',
  news_detail_middle:   'News Middle',
  news_detail_bottom:   'News Bottom',
  blog_detail_top:      'Blog Top',
  blog_detail_middle:   'Blog Middle',
  blog_detail_bottom:   'Blog Bottom',
};

const POSITIONS = [
  'navbar','hero_banner','sidebar','infeed','popup',
  'news_detail_top','news_detail_middle','news_detail_bottom',
  'blog_detail_top','blog_detail_middle','blog_detail_bottom',
];

const fmtDate = (s) => new Date(s).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
const fmtNum  = (n) => (n || 0).toLocaleString();

const AdsList = () => {
  const [ads,             setAds]             = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterPosition,  setFilterPosition]  = useState('all');
  const [filterStatus,    setFilterStatus]    = useState('all');
  const [deleteLoading,   setDeleteLoading]   = useState(null);
  const [selectedAds,     setSelectedAds]     = useState(new Set());
  const [bulkLoading,     setBulkLoading]     = useState(false);

  useEffect(() => { fetchAds(); }, []);

  const fetchAds = async () => {
    try {
      setLoading(true); setError('');
      const res = await getAllAds({ limit: 100 });
      setAds(Array.isArray(res) ? res : res.data ?? []);
    } catch (err) {
      setError('Failed to fetch ads: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = ads.filter(a => {
    const q = searchTerm.toLowerCase();
    const mSearch   = !q || a.title.toLowerCase().includes(q);
    const mPosition = filterPosition === 'all' || a.position === filterPosition;
    const mStatus   = filterStatus   === 'all' || a.status   === filterStatus;
    return mSearch && mPosition && mStatus;
  });

  // summary stats
  const totalImpressions = ads.reduce((s, a) => s + (a.impressions || 0), 0);
  const totalClicks      = ads.reduce((s, a) => s + (a.clicks      || 0), 0);
  const avgCtr           = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const allSel    = filtered.length > 0 && filtered.every(a => selectedAds.has(a.id));
  const toggleSel = (id) => setSelectedAds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => allSel ? setSelectedAds(new Set()) : setSelectedAds(new Set(filtered.map(a => a.id)));

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ad?')) return;
    try {
      setDeleteLoading(id);
      await deleteAd(id);
      setAds(prev => prev.filter(a => a.id !== id));
      setSelectedAds(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch (err) { alert('Failed to delete: ' + err.message); }
    finally { setDeleteLoading(null); }
  };

  const handleBulkDelete = async () => {
    if (!selectedAds.size || !window.confirm(`Delete ${selectedAds.size} ad(s)?`)) return;
    try {
      setBulkLoading(true);
      await Promise.all(Array.from(selectedAds).map(id => deleteAd(id)));
      setAds(prev => prev.filter(a => !selectedAds.has(a.id)));
      setSelectedAds(new Set());
    } catch (err) { alert('Bulk delete failed: ' + err.message); }
    finally { setBulkLoading(false); }
  };

  const statusColor = (s) => ({
    active:    'bg-emerald-100 text-emerald-700',
    inactive:  'bg-slate-100 text-slate-500',
    scheduled: 'bg-amber-100 text-amber-700',
  }[s] || 'bg-slate-100 text-slate-500');

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .spin{animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .trunc{max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .inp{background:#1e2130;border:1px solid rgba(255,255,255,.08);color:#e8eaf0;border-radius:10px;padding:10px 14px;font-size:13px;outline:none;transition:border .15s}
        .inp:focus{border-color:rgba(239,68,68,.5);box-shadow:0 0 0 3px rgba(239,68,68,.1)}
        .inp::placeholder{color:#7c839e}
        .inp option{background:#1e2130}
        .cbtn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;border:none}
        .cbtn:disabled{opacity:.5;cursor:not-allowed}
        .row-h:hover{background:rgba(239,68,68,.04)!important}
        .row-s{background:rgba(239,68,68,.08)!important}
        .cb{width:18px;height:18px;cursor:pointer;accent-color:#ef4444}
        .bulk-bar{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1e2130;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px 24px;display:flex;align-items:center;gap:20px;z-index:50;box-shadow:0 8px 40px rgba(0,0,0,.6)}
      `}</style>

      <AdminNavbar />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'40px 24px 100px' }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800 }}>Ad Management</h1>
            <p className="text-slate-400 text-sm mt-1">{filtered.length} ads</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="cbtn" style={{ background:'#1e2130', color:'#7c839e', border:'1px solid rgba(255,255,255,.08)' }} onClick={fetchAds}>
              <RefreshCw size={15} /> Refresh
            </button>
            {selectedAds.size > 0 && (
              <button className="cbtn" style={{ background:'rgba(239,68,68,.15)', color:'#f04a5a', border:'1px solid rgba(239,68,68,.3)' }} onClick={handleBulkDelete} disabled={bulkLoading}>
                {bulkLoading ? <div className="spin" style={{ width:15,height:15,border:'2px solid rgba(239,68,68,.3)',borderTopColor:'#f04a5a',borderRadius:'50%' }}/> : <Trash2 size={15}/>}
                Delete ({selectedAds.size})
              </button>
            )}
            <a href="/admin/ads/create" className="cbtn" style={{ background:'#ef4444', color:'#fff', textDecoration:'none' }}>
              <Plus size={15} /> Create Ad
            </a>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label:'Total Impressions', value:fmtNum(totalImpressions), icon:<Eye size={18}/>,         color:'#6366f1' },
            { label:'Total Clicks',      value:fmtNum(totalClicks),      icon:<MousePointer size={18}/>, color:'#ef4444' },
            { label:'Avg CTR',           value:`${avgCtr}%`,             icon:<TrendingUp size={18}/>,  color:'#34d399' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ background:'#181c27', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'20px 24px' }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ color, background:`${color}22`, padding:8, borderRadius:8 }}>{icon}</div>
                <p className="text-slate-400 text-sm">{label}</p>
              </div>
              <p style={{ fontSize:28, fontWeight:700, color:'#e8eaf0', fontFamily:"'Syne',sans-serif" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 180px 160px', gap:12, marginBottom:16 }}>
          <div style={{ position:'relative', gridColumn:'span 2' }}>
            <Search size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#7c839e',pointerEvents:'none' }} />
            <input className="inp" style={{ width:'100%',paddingLeft:36,boxSizing:'border-box' }} placeholder="Search ads…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="inp" value={filterPosition} onChange={e => setFilterPosition(e.target.value)}>
            <option value="all">All Positions</option>
            {Object.entries(POSITION_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="inp" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-5 text-sm">{error}</div>}

        {/* Table */}
        <div style={{ background:'#181c27', borderRadius:16, border:'1px solid rgba(255,255,255,.07)', overflow:'hidden' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="spin" style={{ width:36,height:36,border:'3px solid rgba(239,68,68,.2)',borderTopColor:'#ef4444',borderRadius:'50%' }}/>
              <p className="text-slate-400 text-sm">Loading ads…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <BarChart2 size={40} color="#7c839e" strokeWidth={1.2}/>
              <p className="text-slate-400 text-sm">No ads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                    <th style={{ padding:'14px 16px', width:40 }}>
                      <input type="checkbox" className="cb" checked={allSel} onChange={toggleAll}/>
                    </th>
                    {['Preview','Title','Position','Status','Impressions','Clicks','CTR','Dates','Actions'].map(h => (
                      <th key={h} style={{ padding:'14px 16px', textAlign:'left', color:'#7c839e', fontSize:11, fontWeight:600, fontFamily:"'Syne',sans-serif", letterSpacing:'.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ad => (
                    <tr key={ad.id} className={`row-h${selectedAds.has(ad.id)?' row-s':''}`} style={{ borderTop:'1px solid rgba(255,255,255,.07)' }}>
                      <td style={{ padding:'12px 16px' }}><input type="checkbox" className="cb" checked={selectedAds.has(ad.id)} onChange={() => toggleSel(ad.id)}/></td>
                      <td style={{ padding:'12px 16px' }}>
                        {getImageUrl(ad.image) ? (
                          <img src={getImageUrl(ad.image)} alt="" style={{ width:80,height:48,objectFit:'cover',borderRadius:8,background:'#1e2130' }} onError={e=>e.target.style.display='none'}/>
                        ) : (
                          <div style={{ width:80,height:48,background:'#1e2130',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center' }}>
                            <BarChart2 size={18} color="#7c839e"/>
                          </div>
                        )}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div className="trunc" style={{ color:'#e8eaf0', fontSize:13, fontWeight:500 }}>{ad.title}</div>
                        <div style={{ color:'#7c839e', fontSize:11, marginTop:3 }}>{ad.type}</div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:'rgba(99,102,241,.15)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,.3)', padding:'2px 10px', borderRadius:999, fontSize:11, fontWeight:600 }}>
                          {POSITION_LABELS[ad.position] || ad.position}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(ad.status)}`}>{ad.status}</span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#e8eaf0', fontSize:13, fontWeight:600 }}>{fmtNum(ad.impressions)}</td>
                      <td style={{ padding:'12px 16px', color:'#e8eaf0', fontSize:13, fontWeight:600 }}>{fmtNum(ad.clicks)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ color: parseFloat(ad.ctr) > 2 ? '#34d399' : '#e8eaf0', fontSize:13, fontWeight:700 }}>
                          {ad.ctr || '0.00'}%
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#7c839e', fontSize:12 }}>
                        {ad.start_date ? fmtDate(ad.start_date) : '—'}<br/>
                        {ad.end_date   ? fmtDate(ad.end_date)   : '—'}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div className="flex gap-2">
                          <a href={`/admin/ads/${ad.id}`} style={{ display:'flex',alignItems:'center',justifyContent:'center',width:32,height:32,borderRadius:8,background:'rgba(99,179,237,.1)',color:'#63b3ed',textDecoration:'none' }} title="Edit">✏️</a>
                          <a href={`/admin/ads/${ad.id}/stats`} style={{ display:'flex',alignItems:'center',justifyContent:'center',width:32,height:32,borderRadius:8,background:'rgba(52,211,153,.1)',color:'#34d399',textDecoration:'none' }} title="Stats">
                            <BarChart2 size={15}/>
                          </a>
                          <button style={{ display:'flex',alignItems:'center',justifyContent:'center',width:32,height:32,borderRadius:8,background:'rgba(240,74,90,.1)',color:'#f04a5a',border:'none',cursor:'pointer' }} onClick={() => handleDelete(ad.id)} disabled={deleteLoading===ad.id} title="Delete">
                            {deleteLoading===ad.id ? <div className="spin" style={{ width:14,height:14,border:'2px solid rgba(240,74,90,.3)',borderTopColor:'#f04a5a',borderRadius:'50%' }}/> : <Trash2 size={15}/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedAds.size > 0 && (
        <div className="bulk-bar">
          <span style={{ color:'#e8eaf0', fontSize:13, fontWeight:500 }}>{selectedAds.size} selected</span>
          <button onClick={() => setSelectedAds(new Set())} style={{ background:'none',border:'none',color:'#7c839e',fontSize:13,cursor:'pointer' }}>Deselect</button>
          <div style={{ width:1,height:20,background:'rgba(255,255,255,.08)' }}/>
          <button className="cbtn" style={{ background:'rgba(239,68,68,.15)',color:'#f04a5a',border:'1px solid rgba(239,68,68,.3)' }} onClick={handleBulkDelete} disabled={bulkLoading}>
            {bulkLoading ? <div className="spin" style={{ width:14,height:14,border:'2px solid rgba(239,68,68,.3)',borderTopColor:'#f04a5a',borderRadius:'50%' }}/> : <Trash2 size={14}/>}
            Delete All
          </button>
        </div>
      )}
    </div>
  );
};

export default AdsList;