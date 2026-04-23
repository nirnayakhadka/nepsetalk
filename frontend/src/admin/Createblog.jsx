import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UploadCloud, Link as LinkIcon, X, Clock } from 'lucide-react';
import { createBlog, getCategories } from '../services/adminApi';

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

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 14px 10px 36px',
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[['file', <UploadCloud size={13} />, 'Upload File'], ['url', <LinkIcon size={13} />, 'Image URL']].map(([m, icon, label]) => (
          <button key={m} type="button" onClick={() => setMode(m)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: mode === m ? '#0891b2' : 'rgba(255,255,255,.08)',
            color: mode === m ? '#fff' : '#94a3b8', transition: 'all .15s',
          }}>{icon}{label}</button>
        ))}
      </div>

      {preview && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <img src={preview} alt="preview" style={{ height: 110, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(8,145,178,.4)' }} onError={() => setPreview('')} />
          <button type="button" onClick={clear} style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {mode === 'file' && (
        <div onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          style={{ border: `1.5px dashed ${dragOver ? '#0891b2' : 'rgba(255,255,255,.15)'}`, borderRadius: 12, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(8,145,178,.06)' : 'rgba(255,255,255,.02)', transition: 'all .15s' }}>
          <UploadCloud size={28} color={dragOver ? '#0891b2' : '#64748b'} style={{ margin: '0 auto 8px' }} />
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Drag & drop or <span style={{ color: '#67e8f9', textDecoration: 'underline' }}>browse</span></p>
          <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>JPEG, PNG, GIF, WebP · max 5 MB</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {mode === 'url' && (
        <div style={{ position: 'relative' }}>
          <LinkIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          <input type="url" style={inp} placeholder="https://example.com/image.jpg" value={urlInput} onChange={handleUrl}
            onFocus={e => e.target.style.borderColor = 'rgba(8,145,178,.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
        </div>
      )}
    </div>
  );
};

// ── CreateBlog ────────────────────────────────────────────────────────────────
const CreateBlog = () => {
  const navigate = useNavigate();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [categories, setCategories] = useState([]);
  const [imageState, setImageState] = useState({ file: null, url: '' });
  const [formData,   setFormData]   = useState({
    title: '', slug: '', excerpt: '', content: '',
    category_id: '', status: 'draft', read_time: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        // Handle both direct array and {data: []} formats
        const cats = Array.isArray(response) ? response : (response?.data || []);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.category_id) {
      setError('Please fill in all required fields (Title, Content, Category)');
      return;
    }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title',       formData.title);
      fd.append('slug',        formData.slug);
      fd.append('excerpt',     formData.excerpt);
      fd.append('content',     formData.content);
      fd.append('category_id', formData.category_id);
      fd.append('status',      formData.status);
      fd.append('read_time',   formData.read_time);
      if (imageState.file)     fd.append('thumbnail',     imageState.file);
      else if (imageState.url) fd.append('thumbnail_url', imageState.url);

      await createBlog(fd);
      navigate('/admin/blogs');
    } catch (err) {
      setError(err.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const cardCls = {
    background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(12px)',
    borderRadius: 14, border: '1px solid rgba(255,255,255,.08)',
    padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,.2)',
  };
  const inputCls = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px',
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', transition: 'border-color .15s',
  };
  const labelCls = { display: 'block', color: '#e2e8f0', fontWeight: 600, marginBottom: 8, fontSize: 14 };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#0c1a2e 50%,#0f172a 100%)', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus,textarea:focus,select:focus { border-color:rgba(8,145,178,.6) !important; box-shadow:0 0 0 3px rgba(8,145,178,.12); }
        input::placeholder,textarea::placeholder { color:#475569; }
        select option { background:#1e293b; color:#fff; }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button type="button" onClick={() => navigate('/admin/blogs')} style={{ padding: 10, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, cursor: 'pointer', color: '#fff', display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>Create Blog Post</h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Write and publish a new article</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {error && (
            <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', borderRadius: 10, padding: '12px 16px', fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div style={cardCls}>
            <label style={labelCls}>Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputCls} type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Blog post title" required />
          </div>

          {/* Slug */}
          <div style={cardCls}>
            <label style={labelCls}>Slug (URL)</label>
            <input style={{ ...inputCls, opacity: .6, cursor: 'not-allowed' }} type="text" value={formData.slug} readOnly />
            <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>Auto-generated from title</p>
          </div>

          {/* Excerpt */}
          <div style={cardCls}>
            <label style={labelCls}>Excerpt</label>
            <textarea style={{ ...inputCls, minHeight: 80, resize: 'vertical' }} name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="Short summary shown in blog list…" rows={3} />
          </div>

          {/* Content */}
          <div style={cardCls}>
            <label style={labelCls}>Content <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea style={{ ...inputCls, minHeight: 280, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }} name="content" value={formData.content} onChange={handleChange} placeholder="Full blog content — supports HTML tags like <h2>, <p>, <strong>, <blockquote>…" rows={14} required />
            <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>Supports HTML: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;blockquote&gt;</p>
          </div>

          {/* Thumbnail */}
          <div style={cardCls}>
            <label style={labelCls}>Thumbnail Image</label>
            <ImageUploader onChange={setImageState} />
          </div>

          {/* Category + Status + Read time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div style={cardCls}>
              <label style={labelCls}>Category <span style={{ color: '#ef4444' }}>*</span></label>
              <select style={inputCls} name="category_id" value={formData.category_id} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div style={cardCls}>
              <label style={labelCls}>Status</label>
              <select style={inputCls} name="status" value={formData.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div style={cardCls}>
              <label style={labelCls}>Read Time</label>
              <div style={{ position: 'relative' }}>
                <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                <input style={{ ...inputCls, paddingLeft: 34 }} type="text" name="read_time" value={formData.read_time} onChange={handleChange} placeholder="e.g. 5 min read" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => navigate('/admin/blogs')} style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, color: '#94a3b8', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '13px', background: loading ? 'rgba(8,145,178,.4)' : 'linear-gradient(135deg,#0891b2,#0e7490)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity .15s' }}>
              {loading
                ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Publishing…</>
                : <><Plus size={18} />Publish Blog Post</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateBlog;