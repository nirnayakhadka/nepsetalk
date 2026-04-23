const router = require('express').Router();
const { body } = require('express-validator');
const { login, me, getStats } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  login
);

router.get('/me', authenticate, me);
router.get('/stats', authenticate, getStats);

module.exports = router;
