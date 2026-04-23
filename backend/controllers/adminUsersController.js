const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// GET /api/admin/users  — superadmin only
const getAdminUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, role, is_active, last_login, created_at
       FROM admin_users
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/users  — superadmin only
const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM admin_users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'An admin with that email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      'INSERT INTO admin_users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hash, role || 'editor']
    );

    // Audit
    await audit(req.admin.id, 'CREATE_ADMIN', 'admin_users', result.insertId, req.ip);

    res.status(201).json({
      id: result.insertId,
      message: `Admin user "${name}" created successfully`,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id  — superadmin only
const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, is_active, password } = req.body;

    // Prevent superadmin from deactivating their own account
    if (parseInt(id) === req.admin.id && is_active === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const setParts = [];
    const values = [];

    if (name)              { setParts.push('name = ?');      values.push(name.trim()); }
    if (role)              { setParts.push('role = ?');      values.push(role); }
    if (is_active != null) { setParts.push('is_active = ?'); values.push(is_active ? 1 : 0); }
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      setParts.push('password = ?');
      values.push(hash);
    }

    if (!setParts.length) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    values.push(id);
    const [result] = await pool.execute(
      `UPDATE admin_users SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    await audit(req.admin.id, 'UPDATE_ADMIN', 'admin_users', id, req.ip);

    res.json({ message: 'Admin user updated successfully' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id  — superadmin only
const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const [result] = await pool.execute('DELETE FROM admin_users WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Admin user not found' });

    await audit(req.admin.id, 'DELETE_ADMIN', 'admin_users', id, req.ip);

    res.json({ message: 'Admin user deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Audit helper ─────────────────────────────────────────────────────────────
const audit = (adminId, action, entity, entityId, ip) =>
  pool.execute(
    'INSERT INTO audit_log (admin_id, action, entity, entity_id, ip) VALUES (?, ?, ?, ?, ?)',
    [adminId, action, entity, entityId || null, ip || null]
  ).catch(() => {}); // never crash the request for an audit failure

module.exports = { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser };