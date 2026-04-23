const { Ad, AuditLog, AdEvent } = require('../models');
const path = require('path');
const fs = require('fs');

const audit = (adminId, action, entityId, ip) =>
  AuditLog.create({
    admin_id: adminId,
    action,
    entity: 'ad',
    entity_id: entityId || null,
    ip: ip || null
  }).catch(() => {});

// ── helpers ───────────────────────────────────────────────────────────────────
const isAdActive = (ad) => {
  if (ad.status !== 'active' && ad.status !== 'scheduled') return false;
  const now = new Date();
  if (ad.start_date && new Date(ad.start_date) > now) return false;
  if (ad.end_date && new Date(ad.end_date) < now) return false;
  return true;
};

// ── GET /api/ads?position=sidebar  (public — frontend fetches this) ───────────
// Returns active ads for a given position, sorted by priority
const getAdsByPosition = async (req, res, next) => {
  try {
    const { position } = req.query;
    if (!position) return res.status(400).json({ message: 'position query param required' });

    const now = new Date();

    const ads = await Ad.findAll({
      where: {
        position,
        status: ['active', 'scheduled'],
        [require('sequelize').Op.or]: [
          { start_date: null },
          { start_date: { [require('sequelize').Op.lte]: now } }
        ],
        [require('sequelize').Op.or]: [
          { end_date: null },
          { end_date: { [require('sequelize').Op.gte]: now } }
        ]
      },
      attributes: [
        'id', 'title', 'position', 'type', 'image', 'html_content',
        'link_url', 'link_target', 'popup_delay', 'popup_frequency',
        'width', 'height'
      ],
      order: [['priority', 'ASC']],
      limit: 5
    });

    res.json(ads);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/ads/all  (admin — paginated list) ────────────────────────────────
const getAllAds = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset   = (page - 1) * limit;
    const position = req.query.position || null;
    const status   = req.query.status   || null;

    const conditions = [], params = [];
    if (position) { conditions.push('position = ?'); params.push(position); }
    if (status)   { conditions.push('status = ?');   params.push(status);   }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM ads ${where}`, params
    );

    const [rows] = await pool.execute(
      `SELECT *, ROUND(clicks / NULLIF(impressions, 0) * 100, 2) AS ctr
       FROM ads ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({ data: rows, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ── GET /api/ads/:id  (admin) ─────────────────────────────────────────────────
const getAdById = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT *, ROUND(clicks / NULLIF(impressions, 0) * 100, 2) AS ctr
       FROM ads WHERE id = ?`,
      [parseInt(req.params.id)]
    );
    if (!rows.length) return res.status(404).json({ message: 'Ad not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// ── GET /api/ads/:id/stats  (admin — daily breakdown) ────────────────────────
const getAdStats = async (req, res, next) => {
  try {
    const id   = parseInt(req.params.id);
    const days = parseInt(req.query.days) || 30;

    // Check ad exists
    const [adRows] = await pool.execute('SELECT id, title, impressions, clicks FROM ads WHERE id = ?', [id]);
    if (!adRows.length) return res.status(404).json({ message: 'Ad not found' });

    // Daily breakdown
    const [daily] = await pool.execute(
      `SELECT
         DATE(created_at)                           AS date,
         SUM(event_type = 'impression')             AS impressions,
         SUM(event_type = 'click')                  AS clicks,
         ROUND(SUM(event_type = 'click') / NULLIF(SUM(event_type = 'impression'), 0) * 100, 2) AS ctr
       FROM ad_events
       WHERE ad_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [id, days]
    );

    // Top referrer pages
    const [pages] = await pool.execute(
      `SELECT page_url, COUNT(*) AS count
       FROM ad_events
       WHERE ad_id = ? AND event_type = 'impression'
       GROUP BY page_url
       ORDER BY count DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      ad: adRows[0],
      daily,
      top_pages: pages,
    });
  } catch (err) { next(err); }
};

// ── POST /api/ads  (admin) ────────────────────────────────────────────────────
const createAd = async (req, res, next) => {
  try {
    const {
      title, position, type, html_content, link_url, link_target,
      status, priority, start_date, end_date,
      popup_delay, popup_frequency, width, height, thumbnail_url,
    } = req.body;

    const image = req.file ? `/uploads/ads/${req.file.filename}` : thumbnail_url || null;

    const [result] = await pool.execute(
      `INSERT INTO ads
        (title, position, type, image, html_content, link_url, link_target,
         status, priority, start_date, end_date, popup_delay, popup_frequency, width, height)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        title,
        position,
        type         || 'image',
        image,
        html_content || null,
        link_url     || null,
        link_target  || '_blank',
        status       || 'active',
        priority     ? parseInt(priority) : 5,
        start_date   || null,
        end_date     || null,
        popup_delay      ? parseInt(popup_delay)      : 5,
        popup_frequency  ? parseInt(popup_frequency)  : 24,
        width        || null,
        height       || null,
      ]
    );

    await audit(req.admin.id, 'CREATE_AD', result.insertId, req.ip);
    res.status(201).json({ id: result.insertId, message: 'Ad created successfully' });
  } catch (err) { next(err); }
};

// ── PUT /api/ads/:id  (admin) ─────────────────────────────────────────────────
const updateAd = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const {
      title, position, type, html_content, link_url, link_target,
      status, priority, start_date, end_date,
      popup_delay, popup_frequency, width, height, thumbnail_url,
    } = req.body;

    const [existing] = await pool.execute('SELECT id, image FROM ads WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Ad not found' });

    let image = existing[0].image;
    if (req.file) {
      if (image && image.startsWith('/uploads/')) {
        fs.unlink(path.join(__dirname, '..', 'public', image), () => {});
      }
      image = `/uploads/ads/${req.file.filename}`;
    } else if (thumbnail_url !== undefined) {
      image = thumbnail_url || null;
    }

    await pool.execute(
      `UPDATE ads SET
        title=?, position=?, type=?, image=?, html_content=?, link_url=?, link_target=?,
        status=?, priority=?, start_date=?, end_date=?,
        popup_delay=?, popup_frequency=?, width=?, height=?
       WHERE id=?`,
      [
        title, position,
        type         || 'image',
        image,
        html_content || null,
        link_url     || null,
        link_target  || '_blank',
        status       || 'active',
        priority     ? parseInt(priority) : 5,
        start_date   || null,
        end_date     || null,
        popup_delay      ? parseInt(popup_delay)      : 5,
        popup_frequency  ? parseInt(popup_frequency)  : 24,
        width        || null,
        height       || null,
        id,
      ]
    );

    await audit(req.admin.id, 'UPDATE_AD', id, req.ip);
    res.json({ message: 'Ad updated successfully' });
  } catch (err) { next(err); }
};

// ── DELETE /api/ads/:id  (admin) ──────────────────────────────────────────────
const deleteAd = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.execute('SELECT image FROM ads WHERE id = ?', [id]);
    if (rows.length && rows[0].image?.startsWith('/uploads/')) {
      fs.unlink(path.join(__dirname, '..', 'public', rows[0].image), () => {});
    }
    const [result] = await pool.execute('DELETE FROM ads WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Ad not found' });
    await audit(req.admin.id, 'DELETE_AD', id, req.ip);
    res.json({ message: 'Ad deleted successfully' });
  } catch (err) { next(err); }
};

// ── POST /api/ads/:id/impression  (public — called by frontend on mount) ──────
const trackImpression = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const ip = req.ip;
    const user_agent = req.headers['user-agent']?.slice(0, 500) || null;
    const page_url = req.body.page_url?.slice(0, 1000) || null;

    // increment counter + insert event row (non-blocking)
    Ad.increment('impressions', { where: { id } }).catch(() => {});
    AdEvent.create({
      ad_id: id,
      event_type: 'impression',
      ip,
      user_agent,
      page_url
    }).catch(() => {});

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/ads/:id/click  (public — called by frontend on click) ───────────
const trackClick = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const ip = req.ip;
    const user_agent = req.headers['user-agent']?.slice(0, 500) || null;
    const page_url = req.body.page_url?.slice(0, 1000) || null;

    Ad.increment('clicks', { where: { id } }).catch(() => {});
    AdEvent.create({
      ad_id: id,
      event_type: 'click',
      ip,
      user_agent,
      page_url
    }).catch(() => {});

    // Return the link_url so frontend can redirect
    const ad = await Ad.findByPk(id, { attributes: ['link_url', 'link_target'] });
    res.json({ ok: true, link_url: ad?.link_url, link_target: ad?.link_target });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdsByPosition, getAllAds, getAdById, getAdStats,
  createAd, updateAd, deleteAd,
  trackImpression, trackClick,
};