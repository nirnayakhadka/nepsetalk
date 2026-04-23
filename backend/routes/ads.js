const router  = require('express').Router();
const { body } = require('express-validator');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const {
  getAdsByPosition, getAllAds, getAdById, getAdStats,
  createAd, updateAd, deleteAd,
  trackImpression, trackClick,
} = require('../controllers/adscontroller');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

// ── Multer ────────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'ads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase());
  ok ? cb(null, true) : cb(new Error('Only image files allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('thumbnail');

const uploadMiddleware = (req, res, next) =>
  upload(req, res, (err) => {
    if (!err) return next();
    res.status(400).json({ message: err instanceof multer.MulterError ? `Upload error: ${err.message}` : err.message });
  });

// ── Validation ────────────────────────────────────────────────────────────────
const POSITIONS = [
  'navbar','hero_banner','sidebar','infeed','popup',
  'news_detail_top','news_detail_middle','news_detail_bottom',
  'blog_detail_top','blog_detail_middle','blog_detail_bottom',
];

const adValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('position').isIn(POSITIONS).withMessage('Invalid position'),
  body('type').optional().isIn(['image','html']),
  body('link_target').optional().isIn(['_blank','_self']),
  body('status').optional().isIn(['active','inactive','scheduled']),
  body('priority').optional().isInt({ min: 1, max: 10 }),
  body('popup_delay').optional().isInt({ min: 0 }),
  body('popup_frequency').optional().isInt({ min: 0 }),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// Public
router.get('/',              getAdsByPosition);   // ?position=sidebar
router.post('/:id/impression', trackImpression);
router.post('/:id/click',      trackClick);

// Admin
router.get('/all',     authenticate, getAllAds);
router.get('/:id',     authenticate, getAdById);
router.get('/:id/stats', authenticate, getAdStats);
router.post('/',       authenticate, uploadMiddleware, adValidation, validate, createAd);
router.put('/:id',     authenticate, uploadMiddleware, adValidation, validate, updateAd);
router.delete('/:id',  authenticate, deleteAd);

module.exports = router;