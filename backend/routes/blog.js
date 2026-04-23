const router  = require('express').Router();
const { body } = require('express-validator');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

// ── Multer ────────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'blogs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())
          && /jpeg|jpg|png|gif|webp/.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('thumbnail');

const uploadMiddleware = (req, res, next) =>
  upload(req, res, (err) => {
    if (!err) return next();
    res.status(400).json({ message: err instanceof multer.MulterError ? `Upload error: ${err.message}` : err.message });
  });

// ── Validation ────────────────────────────────────────────────────────────────
const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 500 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('category_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('thumbnail_url').optional({ nullable: true, checkFalsy: true }).isURL(),
  body('read_time').optional({ nullable: true }).isString(),
];

// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/',    getBlogs);
router.get('/:id', getBlogById);   // supports both numeric id and slug

router.post('/',    authenticate, uploadMiddleware, blogValidation, validate, createBlog);
router.put('/:id',  authenticate, uploadMiddleware, blogValidation, validate, updateBlog);
router.delete('/:id', authenticate, deleteBlog);

module.exports = router;