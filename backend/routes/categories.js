const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');

// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add category
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  try {
    let category = await Category.findOne({ name, user: req.user.id });
    if (category) return res.status(400).json({ message: 'Category already exists' });
    category = new Category({ name, user: req.user.id });
    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
