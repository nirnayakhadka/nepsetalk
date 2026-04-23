import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, UploadCloud, Link, X } from 'lucide-react'
import { createNews, getCategories } from '../services/adminApi'

// ─── ImageUploader (inline — no separate file needed) ─────────────────────────
const ImageUploader = ({ onChange }) => {
  const [mode,     setMode]     = useState('file')   // 'file' | 'url'
  const [preview,  setPreview]  = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
    onChange({ file, url: '' })
  }

  const handleUrl = (e) => {
    const url = e.target.value
    setUrlInput(url)
    setPreview(url)
    onChange({ file: null, url })
  }

  const clear = () => {
    setPreview('')
    setUrlInput('')
    onChange({ file: null, url: '' })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[['file', <UploadCloud size={13} />, 'Upload File'], ['url', <Link size={13} />, 'Image URL']].map(([m, icon, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all .15s',
              background: mode === m ? '#7c3aed' : 'rgba(255,255,255,.08)',
              color: mode === m ? '#fff' : '#94a3b8',
            }}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Preview */}
      {preview && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <img
            src={preview}
            alt="preview"
            style={{ height: 120, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(124,58,237,.4)' }}
            onError={() => setPreview('')}
          />
          <button
            type="button"
            onClick={clear}
            style={{
              position: 'absolute', top: -8, right: -8,
              background: '#ef4444', border: 'none', borderRadius: '50%',
              width: 22, height: 22, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#fff',
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* File drop zone */}
      {mode === 'file' && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          style={{
            border: `1.5px dashed ${dragOver ? '#7c3aed' : 'rgba(255,255,255,.15)'}`,
            borderRadius: 12, padding: '24px 16px', textAlign: 'center',
            cursor: 'pointer', transition: 'all .15s',
            background: dragOver ? 'rgba(124,58,237,.08)' : 'rgba(255,255,255,.03)',
          }}
        >
          <UploadCloud size={28} color={dragOver ? '#7c3aed' : '#64748b'} style={{ margin: '0 auto 8px' }} />
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
            Drag & drop or <span style={{ color: '#a78bfa', textDecoration: 'underline' }}>browse</span>
          </p>
          <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>JPEG, PNG, GIF, WebP · max 5 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* URL input */}
      {mode === 'url' && (
        <div style={{ position: 'relative' }}>
          <Link size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={handleUrl}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px 12px 36px',
              background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
          />
        </div>
      )}
    </div>
  )
}

// ─── CreateNews ───────────────────────────────────────────────────────────────
const CreateNews = () => {
  const navigate = useNavigate()
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [categories, setCategories] = useState([])
  const [imageState, setImageState] = useState({ file: null, url: '' })
  const [formData,   setFormData]   = useState({
    title:       '',
    slug:        '',
    excerpt:     '',
    content:     '',
    category_id: '',
    status:      'draft',
  })

  useEffect(() => {
    getCategories()
      .then(data => setCategories(data || []))
      .catch(err => console.error('Failed to fetch categories:', err))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      }),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.content || !formData.category_id) {
      setError('Please fill in all required fields (Title, Content, Category)')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Always use FormData so multer can handle file uploads
      const fd = new FormData()
      fd.append('title',       formData.title)
      fd.append('slug',        formData.slug)
      fd.append('excerpt',     formData.excerpt)
      fd.append('content',     formData.content)
      fd.append('category_id', formData.category_id)
      fd.append('status',      formData.status)

      if (imageState.file) {
        // File upload — multer picks this up as req.file
        fd.append('thumbnail', imageState.file)
      } else if (imageState.url) {
        // URL fallback — controller reads as req.body.thumbnail_url
        fd.append('thumbnail_url', imageState.url)
      }

      await createNews(fd)
      navigate('/admin/news')
    } catch (err) {
      setError(err.message || 'Failed to create news')
    } finally {
      setLoading(false)
    }
  }

  // ── shared input styles ──────────────────────────────────────────────────
  const inputCls = {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 16px',
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', resize: 'vertical',
    transition: 'border-color .15s',
  }
  const labelCls = { display: 'block', color: '#e2e8f0', fontWeight: 600, marginBottom: 8, fontSize: 14 }
  const cardCls  = {
    background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(12px)',
    borderRadius: 16, border: '1px solid rgba(255,255,255,.1)',
    padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,.2)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', padding: '40px 24px', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        input:focus, textarea:focus, select:focus { border-color: rgba(124,58,237,.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,.15); }
        input::placeholder, textarea::placeholder { color: #475569; }
        select option { background: #1e1b4b; color: #fff; }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            style={{ padding: 10, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>
              Create News Article
            </h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Fill in the details below to publish a new article</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', borderRadius: 10, padding: '12px 16px', fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div style={cardCls}>
            <label style={labelCls}>Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputCls} type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter news title" required />
          </div>

          {/* Slug */}
          <div style={cardCls}>
            <label style={labelCls}>Slug (URL)</label>
            <input style={{ ...inputCls, opacity: .6, cursor: 'not-allowed' }} type="text" name="slug" value={formData.slug} readOnly />
            <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>Auto-generated from title</p>
          </div>

          {/* Excerpt */}
          <div style={cardCls}>
            <label style={labelCls}>Excerpt</label>
            <textarea style={{ ...inputCls, minHeight: 80 }} name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="Short summary of the article" rows={3} />
          </div>

          {/* Content */}
          <div style={cardCls}>
            <label style={labelCls}>Content <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea style={{ ...inputCls, minHeight: 240, fontFamily: 'monospace', fontSize: 13 }} name="content" value={formData.content} onChange={handleChange} placeholder="Full article content…" rows={12} required />
          </div>

          {/* Image uploader */}
          <div style={cardCls}>
            <label style={labelCls}>Thumbnail Image</label>
            <ImageUploader onChange={setImageState} />
          </div>

          {/* Category + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={cardCls}>
              <label style={labelCls}>Category <span style={{ color: '#ef4444' }}>*</span></label>
              <select style={inputCls} name="category_id" value={formData.category_id} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
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
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/admin/news')}
              style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, color: '#94a3b8', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2, padding: '14px',
                background: loading ? 'rgba(124,58,237,.4)' : 'linear-gradient(135deg,#7c3aed,#db2777)',
                border: 'none', borderRadius: 12, color: '#fff',
                fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity .15s',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  Creating…
                </>
              ) : (
                <><Plus size={18} /> Create Article</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateNews