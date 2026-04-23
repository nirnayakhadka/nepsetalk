const router = require('express').Router();
const { body } = require('express-validator');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/', getCategories);

router.post(
  '/',
  authenticate,
  [body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 })],
  validate,
  createCategory
);

// Only superadmin can delete categories
router.delete('/:id', authenticate, requireRole('superadmin'), deleteCategory);

module.exports = router;