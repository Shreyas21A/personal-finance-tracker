const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const Joi = require('joi');
const sanitize = require('mongo-sanitize');

// Validation schema
const budgetSchema = Joi.object({
  category: Joi.string().min(1).required().messages({
    'string.min': 'Category cannot be empty',
    'any.required': 'Category is required',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required',
  }),
  period: Joi.string().valid('monthly').default('monthly'),
});

// Create budget
router.post('/', auth, async (req, res) => {
  const { error } = budgetSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const existingBudget = await Budget.findOne({
      user: sanitize(req.user.id),
      category: sanitize(req.body.category),
    });
    if (existingBudget) return res.status(400).json({ message: 'Budget already exists for this category' });

    const budget = new Budget({
      user: sanitize(req.user.id),
      category: sanitize(req.body.category),
      amount: req.body.amount,
      period: req.body.period,
    });
    await budget.save();
    res.json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get budgets with spending
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: sanitize(req.user.id) });
    const budgetData = await Promise.all(budgets.map(async (budget) => {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(sanitize(req.user.id)),
            category: budget.category,
            type: 'expense',
            date: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      return {
        ...budget._doc,
        spent: spent[0]?.total || 0,
      };
    }));
    res.json(budgetData);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;