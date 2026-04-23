const { Category, News } = require('../models');

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    // Get news count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const newsCount = await News.count({
          where: {
            category_id: category.id,
            status: 'published'
          }
        });
        return {
          ...category.toJSON(),
          news_count: newsCount
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name);

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(409).json({ message: 'Category with this name already exists' });
    }

    // Create new category using Sequelize
    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || null
    });

    res.status(201).json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Optional: Check if category has any news before deleting
    const newsCount = await News.count({
      where: { category_id: categoryId }
    });

    if (newsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${newsCount} news articles. Please reassign or delete the news first.` 
      });
    }

    // Delete the category
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Optional: PUT/PATCH /api/categories/:id - Update category
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update slug if name is changing
    let updateData = { description: description || null };
    if (name && name !== category.name) {
      updateData.name = name.trim();
      updateData.slug = slugify(name);
    }

    await category.update(updateData);
    res.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getCategories, 
  createCategory, 
  deleteCategory, 
  updateCategory  // optional
};