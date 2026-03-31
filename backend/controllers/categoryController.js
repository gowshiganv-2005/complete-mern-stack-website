const Category = require('../models/categoryModel');

const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder name');
  res.json({ success: true, categories });
};

const createCategory = async (req, res) => {
  const { name, description, parent, sortOrder } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const image = req.file?.path;
  const category = await Category.create({ name, slug, description, parent, sortOrder, image });
  res.status(201).json({ success: true, category });
};

const updateCategory = async (req, res) => {
  const updates = { ...req.body };
  if (req.file) updates.image = req.file.path;
  const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};

const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
