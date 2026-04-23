const { pool } = require('../config/db');
const path = require('path');
const fs   = require('fs');

const audit = (adminId, action, entityId, ip) =>
  pool.execute(
    'INSERT INTO audit_log (admin_id, action, entity, entity_id, ip) VALUES (?,?,?,?,?)',
    [adminId, action, 'video', entityId || null, ip || null]
  ).catch(() => {});

// ── GET /api/videos  (public) ─────────────────────────────────────────────────
// Returns { main: [...], upnext: [...] } grouped by section — ready for VideoSection component
const getVideos = async (req, res, next) => {
  try {
    const status  = req.query.status  || 'active';
    const section = req.query.section || null;  // optional filter

    const conditions = ['v.status = ?'];
    const params     = [status];

    if (section) {
      conditions.push('v.section = ?');
      params.push(section);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const [rows] = await pool.execute(
      `SELECT v.id, v.title, v.description, v.category, v.duration,
              v.thumbnail, v.url, v.section, v.status, v.sort_order, v.views,
              v.created_at, v.updated_at
       FROM videos v
       ${where}
       ORDER BY v.section ASC, v.sort_order ASC, v.created_at DESC`,
      params
    );

    // Group into { main: [...], upnext: [...] }
    const grouped = rows.reduce((acc, row) => {
      const key = row.section === 'upnext' ? 'upnext' : 'main';
      if (!acc[key]) acc[key] = [];

      // Resolve thumbnail to full URL if it's a local upload
      acc[key].push({
        ...row,
        thumbnail: row.thumbnail || null,
      });
      return acc;
    }, { main: [], upnext: [] });

    res.json(grouped);
  } catch (err) { next(err); }
};

// ── GET /api/videos/all  (admin — paginated) ──────────────────────────────────
const getAllVideos = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const status  = req.query.status  || null;
    const section = req.query.section || null;
    const search  = req.query.search  || null;

    const conditions = [], params = [];
    if (status)  { conditions.push('v.status = ?');        params.push(status); }
    if (section) { conditions.push('v.section = ?');       params.push(section); }
    if (search)  { conditions.push('v.title LIKE ?');      params.push(`%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM videos v ${where}`, params
    );

    const [rows] = await pool.execute(
      `SELECT * FROM videos v ${where}
       ORDER BY v.section ASC, v.sort_order ASC, v.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({ data: rows, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ── GET /api/videos/:id ───────────────────────────────────────────────────────
const getVideoById = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM videos WHERE id = ?', [parseInt(req.params.id)]);
    if (!rows.length) return res.status(404).json({ message: 'Video not found' });

    // Increment views
    await pool.execute('UPDATE videos SET views = views + 1 WHERE id = ?', [rows[0].id]);
    res.json({ ...rows[0], views: rows[0].views + 1 });
  } catch (err) { next(err); }
};

// ── POST /api/videos ──────────────────────────────────────────────────────────
const createVideo = async (req, res, next) => {
  try {
    const { title, description, category, duration, url, section, status, sort_order, thumbnail_url } = req.body;

    // multer file upload OR url fallback
    const thumbnail = req.file
      ? `/uploads/videos/${req.file.filename}`
      : thumbnail_url || null;

    const [result] = await pool.execute(
      `INSERT INTO videos (title, description, category, duration, thumbnail, url, section, status, sort_order)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        title,
        description  || null,
        category     || null,
        duration     || null,
        thumbnail,
        url,
        section      || 'main',
        status       || 'active',
        sort_order   ? parseInt(sort_order) : 0,
      ]
    );

    await audit(req.admin.id, 'CREATE_VIDEO', result.insertId, req.ip);
    res.status(201).json({ id: result.insertId, message: 'Video created successfully' });
  } catch (err) { next(err); }
};

// ── PUT /api/videos/:id ───────────────────────────────────────────────────────
const updateVideo = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, category, duration, url, section, status, sort_order, thumbnail_url } = req.body;

    const [existing] = await pool.execute('SELECT * FROM videos WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Video not found' });

    let thumbnail = existing[0].thumbnail;
    if (req.file) {
      // Delete old local file
      if (thumbnail && thumbnail.startsWith('/uploads/')) {
        fs.unlink(path.join(__dirname, '..', 'public', thumbnail), () => {});
      }
      thumbnail = `/uploads/videos/${req.file.filename}`;
    } else if (thumbnail_url !== undefined) {
      thumbnail = thumbnail_url || null;
    }

    await pool.execute(
      `UPDATE videos SET title=?, description=?, category=?, duration=?, thumbnail=?, url=?, section=?, status=?, sort_order=? WHERE id=?`,
      [
        title,
        description  || null,
        category     || null,
        duration     || null,
        thumbnail,
        url,
        section      || 'main',
        status       || 'active',
        sort_order   ? parseInt(sort_order) : 0,
        id,
      ]
    );

    await audit(req.admin.id, 'UPDATE_VIDEO', id, req.ip);
    res.json({ message: 'Video updated successfully' });
  } catch (err) { next(err); }
};

// ── DELETE /api/videos/:id ────────────────────────────────────────────────────
const deleteVideo = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const [rows] = await pool.execute('SELECT thumbnail FROM videos WHERE id = ?', [id]);
    if (rows.length && rows[0].thumbnail?.startsWith('/uploads/')) {
      fs.unlink(path.join(__dirname, '..', 'public', rows[0].thumbnail), () => {});
    }

    const [result] = await pool.execute('DELETE FROM videos WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Video not found' });

    await audit(req.admin.id, 'DELETE_VIDEO', id, req.ip);
    res.json({ message: 'Video deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { getVideos, getAllVideos, getVideoById, createVideo, updateVideo, deleteVideo };