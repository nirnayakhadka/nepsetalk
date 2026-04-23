const { pool } = require('../config/db');
const path = require('path');
const fs = require('fs');

// ── helpers ───────────────────────────────────────────────────────────────────
const slugify = (text) =>
  text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const uniqueSlug = async (title, excludeId = null) => {
  let base = slugify(title), slug = base, i = 1;
  while (true) {
    const q = excludeId
      ? 'SELECT id FROM blogs WHERE slug = ? AND id != ?'
      : 'SELECT id FROM blogs WHERE slug = ?';
    const p = excludeId ? [slug, String(excludeId)] : [slug];
    const [rows] = await pool.execute(q, p);
    if (!rows.length) break;
    slug = `${base}-${i++}`;
  }
  return slug;
};

const audit = (adminId, action, entityId, ip) =>
  pool.execute(
    'INSERT INTO audit_log (admin_id, action, entity, entity_id, ip) VALUES (?,?,?,?,?)',
    [adminId, action, 'blog', entityId || null, ip || null]
  ).catch(() => {});

// ── GET /api/blogs ─────────────────────────────────────────────────────────────
const getBlogs = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset   = (page - 1) * limit;
    const status   = req.query.status   || null;
    const category = req.query.category || null;
    const search   = req.query.search   || null;

    const conditions = [], params = [];
    if (status)   { conditions.push('b.status = ?');           params.push(status); }
    if (category) { conditions.push('b.category_id = ?');      params.push(parseInt(category)); }
    if (search)   { conditions.push('(b.title LIKE ? OR b.excerpt LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM blogs b ${where}`, params
    );

    const [rows] = await pool.execute(
      `SELECT b.id, b.title, b.slug, b.excerpt, b.status, b.views,
              b.thumbnail AS image, b.read_time,
              b.published_at, b.created_at, b.updated_at,
              c.name AS category_name, c.id AS category_id,
              a.name AS author_name
       FROM blogs b
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN admin_users a ON a.id = b.author_id
       ${where}
       ORDER BY b.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({ data: rows, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ── GET /api/blogs/:id ─────────────────────────────────────────────────────────
const getBlogById = async (req, res, next) => {
  try {
    // support both numeric id and slug
    const param = req.params.id;
    const bySlug = isNaN(param);
    const [rows] = await pool.execute(
      `SELECT b.*, b.thumbnail AS image, c.name AS category_name, a.name AS author_name
       FROM blogs b
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN admin_users a ON a.id = b.author_id
       WHERE ${bySlug ? 'b.slug' : 'b.id'} = ?`,
      [bySlug ? param : parseInt(param)]
    );
    if (!rows.length) return res.status(404).json({ message: 'Blog not found' });

    // increment views
    await pool.execute('UPDATE blogs SET views = views + 1 WHERE id = ?', [rows[0].id]);

    res.json({ ...rows[0], views: rows[0].views + 1 });
  } catch (err) { next(err); }
};

// ── POST /api/blogs ────────────────────────────────────────────────────────────
const createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, category_id, status, thumbnail_url, read_time } = req.body;
    const thumbnail = req.file ? `/uploads/blogs/${req.file.filename}` : thumbnail_url || null;
    const slug = await uniqueSlug(title);
    const published_at = status === 'published' ? new Date() : null;

    const [result] = await pool.execute(
      `INSERT INTO blogs (title, slug, content, excerpt, category_id, author_id, status, thumbnail, read_time, published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [title, slug, content, excerpt || null,
       category_id ? parseInt(category_id) : null,
       req.admin.id, status || 'draft', thumbnail, read_time || null, published_at]
    );

    await audit(req.admin.id, 'CREATE_BLOG', result.insertId, req.ip);
    res.status(201).json({ id: result.insertId, slug, message: 'Blog created successfully' });
  } catch (err) { next(err); }
};

// ── PUT /api/blogs/:id ─────────────────────────────────────────────────────────
const updateBlog = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content, excerpt, category_id, status, thumbnail_url, read_time } = req.body;

    const [existing] = await pool.execute('SELECT id, status, thumbnail FROM blogs WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Blog not found' });

    let thumbnail = existing[0].thumbnail;
    if (req.file) {
      if (thumbnail && thumbnail.startsWith('/uploads/')) {
        fs.unlink(path.join(__dirname, '..', 'public', thumbnail), () => {});
      }
      thumbnail = `/uploads/blogs/${req.file.filename}`;
    } else if (thumbnail_url !== undefined) {
      thumbnail = thumbnail_url || null;
    }

    const slug = await uniqueSlug(title, id);
    const nowPublished = status === 'published' && existing[0].status !== 'published';

    const setParts = ['title=?','slug=?','content=?','excerpt=?','category_id=?','status=?','thumbnail=?','read_time=?'];
    const values   = [title, slug, content, excerpt || null,
                      category_id ? parseInt(category_id) : null,
                      status || 'draft', thumbnail, read_time || null];

    if (nowPublished) { setParts.push('published_at=?'); values.push(new Date()); }
    values.push(id);

    await pool.execute(`UPDATE blogs SET ${setParts.join(',')} WHERE id = ?`, values);
    await audit(req.admin.id, 'UPDATE_BLOG', id, req.ip);
    res.json({ message: 'Blog updated successfully', slug });
  } catch (err) { next(err); }
};

// ── DELETE /api/blogs/:id ──────────────────────────────────────────────────────
const deleteBlog = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute('SELECT thumbnail FROM blogs WHERE id = ?', [id]);
    if (rows.length && rows[0].thumbnail?.startsWith('/uploads/')) {
      fs.unlink(path.join(__dirname, '..', 'public', rows[0].thumbnail), () => {});
    }
    const [result] = await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Blog not found' });
    await audit(req.admin.id, 'DELETE_BLOG', id, req.ip);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };