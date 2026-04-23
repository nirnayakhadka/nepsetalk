const { News, Category, Admin, AuditLog } = require('../models');
const path = require('path');
const fs = require('fs');

// Audit helper
const audit = (adminId, action, entityId, ip) =>
  AuditLog.create({
    admin_id: adminId,
    action,
    entity: 'news',
    entity_id: entityId || null,
    ip: ip || null
  }).catch(() => {});

// Slug generator
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Ensure unique slug
const uniqueSlug = async (title, excludeId = null) => {
  let base = slugify(title);
  let slug = base;
  let i = 1;
  while (true) {
    const where = excludeId ? { slug, id: { [require('sequelize').Op.ne]: excludeId } } : { slug };
    const existing = await News.findOne({ where });
    if (!existing) break;
    slug = `${base}-${i++}`;
  }
  return slug;
};

// GET /api/news
const getNews = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const status = req.query.status || null;
    const categoryId = req.query.category || null;
    const search = req.query.search || null;

    const where = {};
    if (status) where.status = status;
    if (categoryId) where.category_id = parseInt(categoryId);
    if (search) {
      where[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.like]: `%${search}%` } },
        { excerpt: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count: total, rows } = await News.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Admin,
          as: 'author',
          attributes: ['name']
        }
      ],
      attributes: [
  'id', 'title', 'slug', 'excerpt', 'image', 'status', 'views',
  'published_at', 'created_at', 'updated_at'
],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const data = rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      status: row.status,
      views: row.views,
      image: row.image,
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_name: row.category?.name,
      category_id: row.category?.id,
      author_name: row.author?.name
    }));

    res.json({
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/news/:id
const getNewsById = async (req, res, next) => {
  try {
    const news = await News.findByPk(parseInt(req.params.id), {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        },
        {
          model: Admin,
          as: 'author',
          attributes: ['name']
        }
      ],
      attributes: { exclude: [] }
    });

    if (!news) return res.status(404).json({ message: 'News not found' });

    const newsData = {
      ...news.toJSON(),
      category_name: news.category?.name,
      author_name: news.author?.name
    };

    res.json(newsData);
  } catch (err) {
    next(err);
  }
};

// POST /api/news
// req.file is populated by multer (if image uploaded), req.body.thumbnail_url is the URL fallback
const createNews = async (req, res, next) => {
  try {
    const { title, content, excerpt, category_id, status, thumbnail_url } = req.body;
    const image = req.file ? `/uploads/news/${req.file.filename}` : thumbnail_url || null;
    const slug = await uniqueSlug(title);
    const published_at = status === 'published' ? new Date() : null;

    const news = await News.create({
      title, slug, content,
      excerpt: excerpt || null,
      category_id: category_id ? parseInt(category_id) : null,
      author_id: req.admin.id,
      status: status || 'draft',
      image,
      published_at
    });

    await audit(req.admin.id, 'CREATE_NEWS', news.id, req.ip);
    res.status(201).json({ id: news.id, slug, message: 'News created successfully' });
  } catch (err) { next(err); }
};

// PUT /api/news/:id
const updateNews = async (req, res, next) => {
  try {
    const { title, content, excerpt, category_id, status, thumbnail_url } = req.body;
    const id = parseInt(req.params.id);

    const existing = await News.findByPk(id);
    if (!existing) return res.status(404).json({ message: 'News not found' });

    let image = existing.image;
    if (req.file) {
      if (image && image.startsWith('/uploads/')) {
        fs.unlink(path.join(__dirname, '..', 'public', image), () => {});
      }
      image = `/uploads/news/${req.file.filename}`;
    } else if (thumbnail_url !== undefined) {
      image = thumbnail_url || null;
    }

    const slug = await uniqueSlug(title, id);
    const published_at = status === 'published' && existing.status !== 'published' ? new Date() : existing.published_at;

    await existing.update({ title, slug, content, excerpt: excerpt || null, category_id: category_id ? parseInt(category_id) : null, status: status || 'draft', image, published_at });

    await audit(req.admin.id, 'UPDATE_NEWS', id, req.ip);
    res.json({ message: 'News updated successfully', slug });
  } catch (err) { next(err); }
};

// DELETE /api/news/:id
const deleteNews = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await News.findByPk(id);
    if (!existing) return res.status(404).json({ message: 'News not found' });

    if (existing.image && existing.image.startsWith('/uploads/')) {
      fs.unlink(path.join(__dirname, '..', 'public', existing.image), () => {});
    }

    await existing.destroy();
    await audit(req.admin.id, 'DELETE_NEWS', id, req.ip);
    res.json({ message: 'News deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { getNews, getNewsById, createNews, updateNews, deleteNews };