import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UploadCloud, Link as LinkIcon, X, Youtube, SortAsc } from 'lucide-react';
import { createVideo } from '../services/adminApi';

// ── ImageUploader ─────────────────────────────────────────────────────────────
const ImageUploader = ({ onChange }) => {
  const [mode,     setMode]     = useState('url');
  const [preview,  setPreview]  = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onChange({ file, url: '' });
  };

  const handleUrl = (e) => {
    const url = e.target.value;
    setUrlInput(url); setPreview(url);
    onChange({ file: null, url });
  };

  const clear = () => {
    setPreview(''); setUrlInput('');
    onChange({ file: null, url: '' });
    if (fileRef.current) fileRef.current.value = '';
  };

  const inp = { width:'100%', boxSizing:'border-box', padding:'10px 14px 10px 36px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, color:'#fff', fontSize:13, outline:'none' };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {[['file', <UploadCloud size={13}/>, 'Upload'], ['url', <LinkIcon size={13}/>, 'Image URL']].map(([m, icon, label]) => (
          <button key={m} type="button" onClick={() => setMode(m)} style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:mode===m?'#6366f1':'rgba(255,255,255,.08)',color:mode===m?'#fff':'#94a3b8',transition:'all .15s' }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {preview && (
        <div style={{ position:'relative',display:'inline-block',marginBottom:12 }}>
          <img src={preview} alt="preview" style={{ height:90,borderRadius:10,objectFit:'cover',border:'1px solid rgba(99,102,241,.4)' }} onError={() => setPreview('')} />
          <button type="button" onClick={clear} style={{ position:'absolute',top:-8,right:-8,background:'#ef4444',border:'none',borderRadius:'50%',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {mode === 'file' && (
        <div onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          style={{ border:`1.5px dashed ${dragOver?'#6366f1':'rgba(255,255,255,.15)'}`,borderRadius:12,padding:'20px 16px',textAlign:'center',cursor:'pointer',background:dragOver?'rgba(99,102,241,.06)':'rgba(255,255,255,.02)',transition:'all .15s' }}>
          <UploadCloud size={26} color={dragOver?'#6366f1':'#64748b'} style={{ margin:'0 auto 6px' }} />
          <p style={{ color:'#94a3b8',fontSize:13,margin:0 }}>Drag & drop or <span style={{ color:'#a5b4fc',textDecoration:'underline' }}>browse</span></p>
          <p style={{ color:'#475569',fontSize:11,marginTop:4 }}>JPEG, PNG, GIF, WebP · max 5 MB</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {mode === 'url' && (
        <div style={{ position:'relative' }}>
          <LinkIcon size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#64748b',pointerEvents:'none' }} />
          <input type="text" style={inp} placeholder="https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg" value={urlInput} onChange={handleUrl}
            onFocus={e => e.target.style.borderColor='rgba(99,102,241,.6)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,.1)'} />
        </div>
      )}
    </div>
  );
};


// ── CreateVideo ───────────────────────────────────────────────────────────────
const CreateVideo = () => {
  const navigate = useNavigate();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [imageState, setImageState] = useState({ file: null, url: '' });
  const [formData,   setFormData]   = useState({
    title: '', description: '', category: '', duration: '',
    url: '', section: 'main', status: 'active', sort_order: '0',
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
   const toEmbedUrl = (url) => {
  if (!url) return url;
  
  // already an embed URL — return as-is
  if (url.includes('youtube.com/embed/')) return url;

  // https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;

  // https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`;

  // return original if no match
  return url;
};
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.title || !formData.url) {
    setError('Title and Video URL are required'); return;
  }
  setLoading(true); setError('');
  try {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      // convert URL before saving
      fd.append(k, k === 'url' ? toEmbedUrl(v) : v);
    });
    if (imageState.file)     fd.append('thumbnail',     imageState.file);
    else if (imageState.url) fd.append('thumbnail_url', imageState.url);

    await createVideo(fd);
    navigate('/admin/videos');
  } catch (err) {
    setError(err.message || 'Failed to create video');
  } finally {
    setLoading(false);
  }
};

  const card = { background:'rgba(255,255,255,.04)', borderRadius:14, border:'1px solid rgba(255,255,255,.08)', padding:24 };
  const inp  = { width:'100%', boxSizing:'border-box', padding:'11px 14px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', fontFamily:'inherit', transition:'border-color .15s' };
  const lbl  = { display:'block', color:'#e2e8f0', fontWeight:600, marginBottom:8, fontSize:14 };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        input:focus,textarea:focus,select:focus { border-color:rgba(99,102,241,.6) !important; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
        input::placeholder,textarea::placeholder { color:#475569; }
        select option { background:#0f172a; color:#fff; }
        .spin { animation:spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'36px 24px 80px' }}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button type="button" onClick={() => navigate('/admin/videos')} style={{ padding:10, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, cursor:'pointer', color:'#fff', display:'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, margin:0 }}>Add Video</h1>
            <p className="text-slate-500 text-sm mt-1">Add a new video to the broadcast section</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {error && <div style={{ background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', color:'#fca5a5', borderRadius:10, padding:'12px 16px', fontSize:14 }}>{error}</div>}

          {/* Title */}
          <div style={card}>
            <label style={lbl}>Title <span style={{ color:'#ef4444' }}>*</span></label>
            <input style={inp} type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Video title" required />
          </div>

          {/* Description */}
          <div style={card}>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} name="description" value={formData.description} onChange={handleChange} placeholder="Short description shown under the video…" rows={3} />
          </div>

          {/* YouTube URL */}
          <div style={card}>
            <label style={lbl}>
              <span className="flex items-center gap-2"><Youtube size={16} color="#ff0000" /> Video URL (YouTube embed) <span style={{ color:'#ef4444' }}>*</span></span>
            </label>
            <div style={{ position:'relative' }}>
              <Youtube size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#64748b',pointerEvents:'none' }} />
              <input style={{ ...inp, paddingLeft:34 }} type="text" name="url" value={formData.url} onChange={handleChange}
                placeholder="Paste any YouTube URL — youtube.com/watch, youtu.be, or embed format" required />
            </div>
            <p style={{ color:'#475569', fontSize:12, marginTop:8 }}>
              Format: https://www.youtube.com/embed/VIDEO_ID?autoplay=1
            </p>
          </div>

          {/* Thumbnail */}
          <div style={card}>
            <label style={lbl}>Thumbnail</label>
            <ImageUploader onChange={setImageState} />
            <p style={{ color:'#475569', fontSize:12, marginTop:8 }}>
              Tip: Use YouTube thumbnail — https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg
            </p>
          </div>

          {/* Category + Duration */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={card}>
              <label style={lbl}>Category</label>
              <input style={inp} type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Markets, Daily Brief, Explainer" />
            </div>
            <div style={card}>
              <label style={lbl}>Duration</label>
              <input style={inp} type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 08:19" />
            </div>
          </div>

          {/* Section + Status + Sort order */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
            <div style={card}>
              <label style={lbl}>Section</label>
              <select style={inp} name="section" value={formData.section} onChange={handleChange}>
                <option value="main">Main (featured + small cards)</option>
                <option value="upnext">Up Next (sidebar)</option>
              </select>
            </div>
            <div style={card}>
              <label style={lbl}>Status</label>
              <select style={inp} name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={card}>
              <label style={lbl}>Sort Order</label>
              <div style={{ position:'relative' }}>
                <SortAsc size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#64748b',pointerEvents:'none' }} />
                <input style={{ ...inp, paddingLeft:34 }} type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} min="0" placeholder="0" />
              </div>
              <p style={{ color:'#475569', fontSize:11, marginTop:6 }}>Lower = shown first. First main video = featured.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/admin/videos')} style={{ flex:1, padding:'13px', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, color:'#94a3b8', fontWeight:600, fontSize:14, cursor:'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex:2, padding:'13px', background:loading?'rgba(99,102,241,.4)':'#6366f1', border:'none', borderRadius:12, color:'#fff', fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'opacity .15s' }}>
              {loading
                ? <><div className="spin" style={{ width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%' }}/>Saving…</>
                : <><Plus size={18}/>Add Video</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateVideo;