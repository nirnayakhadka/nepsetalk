import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UploadCloud, Link as LinkIcon, X, Calendar, Clock } from 'lucide-react';
import { createAd } from '../services/adminApi';
import AdminNavbar from './admincomponents/AdminNavbar';

const POSITIONS = [
  { value:'navbar',               label:'Navbar — small inline banner' },
  { value:'hero_banner',          label:'Hero Banner — full width below navbar' },
  { value:'sidebar',              label:'Sidebar — right column' },
  { value:'infeed',               label:'In-Feed — between news/blog cards' },
  { value:'popup',                label:'Popup — modal after delay' },
  { value:'news_detail_top',      label:'News Detail — top of article' },
  { value:'news_detail_middle',   label:'News Detail — middle of article' },
  { value:'news_detail_bottom',   label:'News Detail — bottom of article' },
  { value:'blog_detail_top',      label:'Blog Detail — top of article' },
  { value:'blog_detail_middle',   label:'Blog Detail — middle of article' },
  { value:'blog_detail_bottom',   label:'Blog Detail — bottom of article' },
];

// ── ImageUploader ─────────────────────────────────────────────────────────────
const ImageUploader = ({ onChange }) => {
  const [mode,     setMode]     = useState('file');
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

  const inp = { width:'100%',boxSizing:'border-box',padding:'10px 14px 10px 36px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,color:'#fff',fontSize:13,outline:'none' };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {[['file',<UploadCloud size={13}/>,'Upload'],['url',<LinkIcon size={13}/>,'Image URL']].map(([m,icon,label]) => (
          <button key={m} type="button" onClick={() => setMode(m)} style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',background:mode===m?'#ef4444':'rgba(255,255,255,.08)',color:mode===m?'#fff':'#94a3b8',transition:'all .15s' }}>
            {icon}{label}
          </button>
        ))}
      </div>
      {preview && (
        <div style={{ position:'relative',display:'inline-block',marginBottom:12 }}>
          <img src={preview} alt="preview" style={{ height:80,borderRadius:10,objectFit:'cover',border:'1px solid rgba(239,68,68,.4)' }} onError={() => setPreview('')}/>
          <button type="button" onClick={clear} style={{ position:'absolute',top:-8,right:-8,background:'#ef4444',border:'none',borderRadius:'50%',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff' }}>
            <X size={12}/>
          </button>
        </div>
      )}
      {mode === 'file' && (
        <div onClick={() => fileRef.current?.click()}
          onDragOver={e=>{e.preventDefault();setDragOver(true)}}
          onDragLeave={() => setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}}
          style={{ border:`1.5px dashed ${dragOver?'#ef4444':'rgba(255,255,255,.15)'}`,borderRadius:12,padding:'20px 16px',textAlign:'center',cursor:'pointer',background:dragOver?'rgba(239,68,68,.06)':'rgba(255,255,255,.02)',transition:'all .15s' }}>
          <UploadCloud size={26} color={dragOver?'#ef4444':'#64748b'} style={{ margin:'0 auto 6px' }}/>
          <p style={{ color:'#94a3b8',fontSize:13,margin:0 }}>Drag & drop or <span style={{ color:'#fca5a5',textDecoration:'underline' }}>browse</span></p>
          <p style={{ color:'#475569',fontSize:11,marginTop:4 }}>JPEG, PNG, GIF, WebP · max 5 MB</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
        </div>
      )}
      {mode === 'url' && (
        <div style={{ position:'relative' }}>
          <LinkIcon size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#64748b',pointerEvents:'none' }}/>
          <input type="text" style={inp} placeholder="https://example.com/banner.jpg" value={urlInput} onChange={handleUrl}
            onFocus={e=>e.target.style.borderColor='rgba(239,68,68,.6)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'}/>
        </div>
      )}
    </div>
  );
};

// ── CreateAd ──────────────────────────────────────────────────────────────────
const CreateAd = () => {
  const navigate = useNavigate();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [imageState, setImageState] = useState({ file: null, url: '' });
  const [formData,   setFormData]   = useState({
    title: '', position: 'sidebar', type: 'image',
    html_content: '', link_url: '', link_target: '_blank',
    status: 'active', priority: '5',
    start_date: '', end_date: '',
    popup_delay: '5', popup_frequency: '24',
    width: '', height: '',
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.position) {
      setError('Title and Position are required'); return;
    }
    if (formData.type === 'image' && !imageState.file && !imageState.url) {
      setError('Please upload an image or enter an image URL'); return;
    }
    if (formData.type === 'html' && !formData.html_content) {
      setError('HTML content is required for HTML ads'); return;
    }

    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (imageState.file)     fd.append('thumbnail',     imageState.file);
      else if (imageState.url) fd.append('thumbnail_url', imageState.url);

      await createAd(fd);
      navigate('/admin/ads');
    } catch (err) {
      setError(err.message || 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  const card = { background:'rgba(255,255,255,.04)',borderRadius:14,border:'1px solid rgba(255,255,255,.08)',padding:24 };
  const inp  = { width:'100%',boxSizing:'border-box',padding:'11px 14px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',transition:'border-color .15s' };
  const lbl  = { display:'block',color:'#e2e8f0',fontWeight:600,marginBottom:8,fontSize:14 };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        input:focus,textarea:focus,select:focus{border-color:rgba(239,68,68,.6)!important;box-shadow:0 0 0 3px rgba(239,68,68,.1)}
        input::placeholder,textarea::placeholder{color:#475569}
        select option{background:#0f172a;color:#fff}
        .spin{animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <AdminNavbar />

      <div style={{ maxWidth:860,margin:'0 auto',padding:'36px 24px 80px' }}>

        <div className="flex items-center gap-4 mb-8">
          <button type="button" onClick={() => navigate('/admin/ads')} style={{ padding:10,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,cursor:'pointer',color:'#fff',display:'flex' }}>
            <ArrowLeft size={20}/>
          </button>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,margin:0 }}>Create Ad</h1>
            <p className="text-slate-500 text-sm mt-1">Set up a new advertisement</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:20 }}>

          {error && <div style={{ background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.3)',color:'#fca5a5',borderRadius:10,padding:'12px 16px',fontSize:14 }}>{error}</div>}

          {/* Title + Position */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
            <div style={card}>
              <label style={lbl}>Title <span style={{ color:'#ef4444' }}>*</span></label>
              <input style={inp} type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ad name (internal)" required/>
            </div>
            <div style={card}>
              <label style={lbl}>Position <span style={{ color:'#ef4444' }}>*</span></label>
              <select style={inp} name="position" value={formData.position} onChange={handleChange}>
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Type */}
          <div style={card}>
            <label style={lbl}>Ad Type</label>
            <div className="flex gap-3">
              {[['image','🖼️ Image Ad'],['html','</> HTML / Script Ad']].map(([v,label]) => (
                <button key={v} type="button" onClick={() => setFormData(p => ({...p,type:v}))} style={{ flex:1,padding:'12px',borderRadius:10,border:`1.5px solid ${formData.type===v?'#ef4444':'rgba(255,255,255,.1)'}`,background:formData.type===v?'rgba(239,68,68,.1)':'rgba(255,255,255,.03)',color:formData.type===v?'#fca5a5':'#94a3b8',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Image or HTML */}
          {formData.type === 'image' ? (
            <div style={card}>
              <label style={lbl}>Ad Image <span style={{ color:'#ef4444' }}>*</span></label>
              <ImageUploader onChange={setImageState}/>
            </div>
          ) : (
            <div style={card}>
              <label style={lbl}>HTML / Script Content <span style={{ color:'#ef4444' }}>*</span></label>
              <textarea style={{ ...inp,minHeight:160,fontFamily:'monospace',fontSize:13,resize:'vertical' }} name="html_content" value={formData.html_content} onChange={handleChange} placeholder="<script>...</script> or HTML banner code"/>
            </div>
          )}

          {/* Link */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:20 }}>
            <div style={card}>
              <label style={lbl}>Destination URL</label>
              <div style={{ position:'relative' }}>
                <LinkIcon size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#64748b',pointerEvents:'none' }}/>
                <input style={{ ...inp,paddingLeft:34 }} type="text" name="link_url" value={formData.link_url} onChange={handleChange} placeholder="https://advertiser.com"/>
              </div>
            </div>
            <div style={{ ...card,minWidth:140 }}>
              <label style={lbl}>Open in</label>
              <select style={inp} name="link_target" value={formData.link_target} onChange={handleChange}>
                <option value="_blank">New tab</option>
                <option value="_self">Same tab</option>
              </select>
            </div>
          </div>

          {/* Status + Priority */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
            <div style={card}>
              <label style={lbl}>Status</label>
              <select style={inp} name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div style={card}>
              <label style={lbl}>Priority <span style={{ color:'#7c839e',fontWeight:400,fontSize:12 }}>(1=highest, 10=lowest)</span></label>
              <input style={inp} type="number" name="priority" value={formData.priority} onChange={handleChange} min="1" max="10"/>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
            <div style={card}>
              <label style={lbl}><Calendar size={14} style={{ display:'inline',marginRight:6 }}/>Start Date</label>
              <input style={inp} type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange}/>
              <p style={{ color:'#475569',fontSize:12,marginTop:6 }}>Leave empty = show immediately</p>
            </div>
            <div style={card}>
              <label style={lbl}><Calendar size={14} style={{ display:'inline',marginRight:6 }}/>End Date</label>
              <input style={inp} type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange}/>
              <p style={{ color:'#475569',fontSize:12,marginTop:6 }}>Leave empty = no expiry</p>
            </div>
          </div>

          {/* Size hints */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
            <div style={card}>
              <label style={lbl}>Width <span style={{ color:'#7c839e',fontWeight:400,fontSize:12 }}>(optional)</span></label>
              <input style={inp} type="text" name="width" value={formData.width} onChange={handleChange} placeholder="e.g. 728px or 100%"/>
            </div>
            <div style={card}>
              <label style={lbl}>Height <span style={{ color:'#7c839e',fontWeight:400,fontSize:12 }}>(optional)</span></label>
              <input style={inp} type="text" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 90px or 250px"/>
            </div>
          </div>

          {/* Popup specific */}
          {formData.position === 'popup' && (
            <div style={{ ...card,border:'1px solid rgba(239,68,68,.2)',background:'rgba(239,68,68,.04)' }}>
              <label style={{ ...lbl,color:'#fca5a5' }}>Popup Settings</label>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                <div>
                  <label style={{ ...lbl,fontSize:13 }}><Clock size={13} style={{ display:'inline',marginRight:6 }}/>Delay (seconds)</label>
                  <input style={inp} type="number" name="popup_delay" value={formData.popup_delay} onChange={handleChange} min="0"/>
                  <p style={{ color:'#475569',fontSize:12,marginTop:6 }}>Seconds before popup shows</p>
                </div>
                <div>
                  <label style={{ ...lbl,fontSize:13 }}>Frequency (hours)</label>
                  <input style={inp} type="number" name="popup_frequency" value={formData.popup_frequency} onChange={handleChange} min="0"/>
                  <p style={{ color:'#475569',fontSize:12,marginTop:6 }}>Hours before showing again to same user</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/admin/ads')} style={{ flex:1,padding:'13px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,color:'#94a3b8',fontWeight:600,fontSize:14,cursor:'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex:2,padding:'13px',background:loading?'rgba(239,68,68,.4)':'#ef4444',border:'none',borderRadius:12,color:'#fff',fontWeight:700,fontSize:14,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'opacity .15s' }}>
              {loading
                ? <><div style={{ width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>Saving…</>
                : <><Plus size={18}/>Create Ad</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateAd;