import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, User, ArrowLeft, Share2, BookOpen, Eye, ArrowRight } from 'lucide-react';
import { getBlogById, getBlogs, getImageUrl } from '../services/adminApi';
import AdSlot from '../components/ads/AdSlot';

const BlogDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [blog,       setBlog]       = useState(null);
  const [related,    setRelated]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await getBlogById(id);
        setBlog(data);

        // fetch related — same category, exclude current
        const all = await getBlogs(`?limit=20&status=published`);
        const rel = all
          .filter(b => b.id !== data.id && b.category_name === data.category_name)
          .slice(0, 3);
        // if not enough in same category, pad with latest
        if (rel.length < 3) {
          const extra = all.filter(b => b.id !== data.id && !rel.find(r => r.id === b.id));
          rel.push(...extra.slice(0, 3 - rel.length));
        }
        setRelated(rel);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('लिंक कपी गरियो!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: "'Lora', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
        :root {
          --ink: #1a1a18; --ink2: #3d3d38; --muted: #8a8a82;
          --rule: #e8e8e2; --cream: #fafaf8; --accent: #c8381e;
          --accent-light: #fdf3f1; --card: #ffffff;
        }
        * { box-sizing: border-box; }
        .outfit { font-family: 'Outfit', sans-serif; }
        .lora   { font-family: 'Lora', serif; }

        /* prose styles for blog content */
        .blog-prose { color: var(--ink2); font-size: 18px; line-height: 1.85; }
        .blog-prose p  { margin-bottom: 1.4em; }
        .blog-prose h2 { font-family: 'Lora', serif; font-size: 26px; font-weight: 700; color: var(--ink); margin: 2em 0 .6em; padding-bottom: .4em; border-bottom: 1.5px solid var(--rule); }
        .blog-prose h3 { font-family: 'Lora', serif; font-size: 21px; font-weight: 600; color: var(--ink); margin: 1.6em 0 .5em; }
        .blog-prose ul, .blog-prose ol { margin: 0 0 1.4em 1.6em; }
        .blog-prose li { margin-bottom: .4em; }
        .blog-prose blockquote { border-left: 4px solid var(--accent); margin: 1.6em 0; padding: .6em 1.4em; background: var(--accent-light); border-radius: 0 6px 6px 0; font-style: italic; color: var(--ink2); }
        .blog-prose a  { color: var(--accent); text-decoration: underline; }
        .blog-prose img { max-width: 100%; border-radius: 8px; margin: 1.6em 0; }
        .blog-prose strong { color: var(--ink); font-weight: 700; }

        /* related card */
        .rel-card { background: var(--card); border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.06); transition: box-shadow .2s, transform .2s; }
        .rel-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.1); transform: translateY(-3px); }
        .rel-img { height: 160px; overflow: hidden; background: #e8e8e2; position: relative; }
        .rel-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
        .rel-card:hover .rel-img img { transform: scale(1.06); }

        /* cat badge */
        .cat-badge { display: inline-block; background: var(--accent-light); color: var(--accent); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 4px; font-family:'Outfit',sans-serif; letter-spacing:.04em; text-transform:uppercase; }

        /* action btn */
        .act-btn { display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; border:1.5px solid var(--rule); background:var(--card); color:var(--ink2); font-family:'Outfit',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:all .15s; }
        .act-btn:hover { border-color:var(--accent); color:var(--accent); }

        /* skel */
        .skel { background:linear-gradient(90deg,#f0f0ec 25%,#e8e8e2 50%,#f0f0ec 75%); background-size:200%; animation:shimmer 1.4s infinite; border-radius:8px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="outfit act-btn"
          style={{ marginBottom: 28 }}
        >
          <ArrowLeft size={16} /> फिर्ता जानुहोस्
        </button>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="skel" style={{ height: 420, borderRadius: 12 }} />
              <div className="skel" style={{ height: 32, width: '70%' }} />
              <div className="skel" style={{ height: 20, width: '40%' }} />
              {[1,2,3,4].map(i => <div key={i} className="skel" style={{ height: 16 }} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => <div key={i} className="skel" style={{ height: 200, borderRadius: 10 }} />)}
            </div>
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p className="lora" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 12 }}>ब्लग फेला परेन</p>
            <Link to="/blog" className="outfit" style={{ color: 'var(--accent)', fontSize: 14 }}>ब्लग पृष्ठमा फर्कनुहोस्</Link>
          </div>
        )}

        {/* Content */}
        {!loading && blog && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48, alignItems: 'start' }}>

            {/* ── Main article ── */}
            <article style={{ background: 'var(--card)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>

              {/* Hero image */}
              {getImageUrl(blog.image) && (
                <div style={{ height: 420, overflow: 'hidden', background: '#e8e8e2', position: 'relative' }}>
                  <img
                    src={getImageUrl(blog.image)}
                    alt={blog.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.3) 0%, transparent 50%)' }} />
                  {blog.category_name && (
                    <div style={{ position: 'absolute', top: 20, left: 20 }}>
                      <span className="cat-badge">{blog.category_name}</span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ padding: '36px 40px 48px' }}>
                {/* Category (if no image) */}
                {!getImageUrl(blog.image) && blog.category_name && (
                  <span className="cat-badge" style={{ marginBottom: 16, display: 'inline-block' }}>{blog.category_name}</span>
                )}

                {/* Title */}
                <h1 className="lora" style={{ fontSize: 34, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, margin: '0 0 20px' }}>
                  {blog.title}
                </h1>

                {/* Meta row */}
                <div className="outfit" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, paddingBottom: 20, marginBottom: 28, borderBottom: '1.5px solid var(--rule)', fontSize: 13, color: 'var(--muted)' }}>
                  {blog.author_name && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} />
                      <span style={{ color: 'var(--ink2)', fontWeight: 500 }}>{blog.author_name}</span>
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} />
                    {new Date(blog.created_at).toLocaleDateString('ne')}
                  </span>
                  {blog.read_time && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} />{blog.read_time}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Eye size={14} />{(blog.views || 0).toLocaleString()} views
                  </span>
                  <button className="act-btn" style={{ marginLeft: 'auto', padding: '6px 12px' }} onClick={handleShare}>
                    <Share2 size={14} /> साझेदारी
                  </button>
                </div>

                {/* Blog body */}
                <div
                  className="blog-prose"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Blog Detail Top Ad */}
                <AdSlot position="blog_detail_top" className="my-8" />

                {/* Blog Detail Middle Ad */}
                <AdSlot position="blog_detail_middle" className="my-8" />

                {/* Blog Detail Bottom Ad */}
                <AdSlot position="blog_detail_bottom" className="my-8" />
              </div>
            </article>

            {/* ── Sidebar ── */}
            <aside style={{ position: 'sticky', top: 24 }}>
              <div style={{ background: 'var(--card)', borderRadius: 12, padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,.06)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1.5px solid var(--rule)' }}>
                  <BookOpen size={18} color="var(--accent)" />
                  <h2 className="lora" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>सम्बन्धित लेखहरू</h2>
                </div>

                {related.length === 0 && (
                  <p className="outfit" style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>कुनै सम्बन्धित लेख छैन</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {related.map(rel => (
                    <Link key={rel.id} to={`/blog/${rel.id}`} style={{ textDecoration: 'none' }}>
                      <div className="rel-card">
                        <div className="rel-img">
                          {getImageUrl(rel.image) ? (
                            <img src={getImageUrl(rel.image)} alt={rel.title} onError={e => e.target.style.display='none'} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e8e8e2,#d0d0c8)' }} />
                          )}
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          {rel.category_name && <span className="cat-badge" style={{ marginBottom: 8, display: 'inline-block' }}>{rel.category_name}</span>}
                          <h3 className="lora" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {rel.title}
                          </h3>
                          <div className="outfit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={11} />{new Date(rel.created_at).toLocaleDateString('ne')}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--accent)', fontWeight: 600 }}>
                              पढ्नुहोस् <ArrowRight size={11} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sidebar Ad */}
              <AdSlot position="sidebar" className="mb-6" />

              {/* Author card */}
              {blog.author_name && (
                <div style={{ background: 'var(--card)', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
                  <h3 className="lora" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px', paddingBottom: 12, borderBottom: '1.5px solid var(--rule)' }}>
                    लेखकको बारेमा
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={20} color="var(--accent)" />
                    </div>
                    <div>
                      <p className="outfit" style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14, margin: 0 }}>{blog.author_name}</p>
                      <p className="outfit" style={{ color: 'var(--muted)', fontSize: 12, margin: 0, marginTop: 2 }}>NepseTalk लेखक</p>
                    </div>
                  </div>
                </div>
              )}
            </aside>

          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;