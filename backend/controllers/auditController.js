const { pool } = require('../config/db');

// GET /api/admin/audit  — superadmin only
const getAuditLog = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) AS total FROM audit_log');

    const [rows] = await pool.execute(
      `SELECT al.id, al.action, al.entity, al.entity_id, al.ip, al.meta, al.created_at,
              u.name AS admin_name, u.email AS admin_email
       FROM audit_log al
       LEFT JOIN admin_users u ON u.id = al.admin_id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      data: rows,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLog };