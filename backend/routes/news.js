const router = require('express').Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { getNews, getNewsById, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// ─── Multer Setup ─────────────────────────────────────────────────────────────
// Multer belongs in ROUTES — it's request middleware, not data-model logic.
// The model defines shape; multer handles the HTTP multipart upload.

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'news');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

// 'thumbnail' matches the FormData field name sent from the frontend
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
}).single('thumbnail');

// Wrap multer so validation errors surface as 400s, not 500s
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    return res.status(400).json({ message: err.message });
  });
};

// ─── Validation ───────────────────────────────────────────────────────────────
const newsValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 500 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('category_id').optional({ nullable: true }).isInt({ min: 1 }),
  // thumbnail_url is the URL fallback when no file is uploaded
  body('thumbnail_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('Thumbnail URL must be a valid URL'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public
router.get('/', getNews);
router.get('/:id', getNewsById);

// Protected — uploadMiddleware runs before validation so req.file is available
router.post('/', authenticate, uploadMiddleware, newsValidation, validate, createNews);
router.put('/:id', authenticate, uploadMiddleware, newsValidation, validate, updateNews);
router.delete('/:id', authenticate, deleteNews);

module.exports = router;