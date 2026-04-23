const router  = require('express').Router();
const { body } = require('express-validator');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const { getVideos, getAllVideos, getVideoById, createVideo, updateVideo, deleteVideo } = require('../controllers/Videocontroller');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

// ── Multer ────────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'videos');
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
const videoValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 500 }),
  body('url').trim().notEmpty().withMessage('Video URL is required'),
  body('section').optional().isIn(['main', 'upnext']).withMessage('Section must be main or upnext'),
  body('status').optional().isIn(['active', 'inactive']),
  body('sort_order').optional({ nullable: true }).isInt({ min: 0 }),
  body('thumbnail_url').optional({ nullable: true, checkFalsy: true }).isURL(),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// Public — for VideoSection component
router.get('/', getVideos);

// Admin — paginated list with all statuses
router.get('/all', authenticate, getAllVideos);

router.get('/:id',    getVideoById);
router.post('/',      authenticate, uploadMiddleware, videoValidation, validate, createVideo);
router.put('/:id',    authenticate, uploadMiddleware, videoValidation, validate, updateVideo);
router.delete('/:id', authenticate, deleteVideo);

module.exports = router;