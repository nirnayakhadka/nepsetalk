const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, News, Category } = require('../models');

// POST /api/admin/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    // Use generic message to avoid user enumeration
    const INVALID_MSG = 'Invalid email or password';

    if (!admin) {
      return res.status(401).json({ message: INVALID_MSG });
    }

    if (!admin.is_active) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: INVALID_MSG });
    }

    // Update last login timestamp
    await admin.update({ last_login: new Date() });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/me  (protected)
const me = async (req, res) => {
  res.json({ user: req.admin });
};

// GET /api/admin/stats  (protected)
const getStats = async (req, res, next) => {
  try {
    const totalNews = await News.count();
    const published = await News.count({ where: { status: 'published' } });
    const drafts = await News.count({ where: { status: 'draft' } });
    const totalCategories = await Category.count();
    const totalViewsResult = await News.sum('views') || 0;

    res.json({ totalNews, published, drafts, totalCategories, totalViews: totalViewsResult });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, me, getStats };