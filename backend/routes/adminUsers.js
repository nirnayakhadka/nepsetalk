const router = require('express').Router();
const { body } = require('express-validator');
const {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} = require('../controllers/adminUsersController');
const { getAuditLog } = require('../controllers/auditController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All routes here require superadmin
router.use(authenticate, requireRole('superadmin'));

router.get('/', getAdminUsers);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
    body('role').optional().isIn(['superadmin', 'editor']).withMessage('Invalid role'),
  ],
  validate,
  createAdminUser
);

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('role').optional().isIn(['superadmin', 'editor']),
    body('is_active').optional().isBoolean(),
    body('password')
      .optional()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
  ],
  validate,
  updateAdminUser
);

router.delete('/:id', deleteAdminUser);

// Audit log
router.get('/audit', getAuditLog);

module.exports = router;