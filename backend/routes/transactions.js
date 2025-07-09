const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const Joi = require('joi');
const sanitize = require('mongo-sanitize');

// Validation schema
const transactionSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required',
  }),
  category: Joi.string().min(1).required().messages({
    'string.min': 'Category cannot be empty',
    'any.required': 'Category is required',
  }),
  description: Joi.string().allow('').optional(),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.only': 'Type must be either income or expense',
    'any.required': 'Type is required',
  }),
  date: Joi.date().required().messages({
    'any.required': 'Date is required',
  }),
});

// Create transaction
router.post('/', auth, async (req, res) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const transaction = new Transaction({
      user: sanitize(req.user.id),
      amount: req.body.amount,
      category: sanitize(req.body.category),
      description: sanitize(req.body.description),
      type: req.body.type,
      date: new Date(req.body.date),
    });
    const savedTransaction = await transaction.save();
    console.log('POST /api/transactions:', savedTransaction);
    res.json(savedTransaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: sanitize(req.user.id) }).sort({ date: -1 });
    console.log('GET /api/transactions:', transactions);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  const { error } = transactionSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    let transaction = await Transaction.findById(sanitize(req.params.id));
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    transaction = await Transaction.findByIdAndUpdate(
      sanitize(req.params.id),
      {
        amount: req.body.amount,
        category: sanitize(req.body.category),
        description: sanitize(req.body.description),
        type: req.body.type,
        date: new Date(req.body.date),
      },
      { new: true }
    );
    console.log('PUT /api/transactions/:id:', transaction);
    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(sanitize(req.params.id));
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await Transaction.findByIdAndDelete(sanitize(req.params.id));
    console.log('DELETE /api/transactions/:id:', transaction);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transactions by category (for chart)
router.get('/by-category', auth, async (req, res) => {
  try {
    const transactions = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(sanitize(req.user.id)), type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);
    console.log('GET /api/transactions/by-category:', transactions);
    res.json(transactions);
  } catch (error) {
    console.error('By-category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction summary (total income, expenses, balance)
router.get('/summary', auth, async (req, res) => {
  try {
    const transactions = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(sanitize(req.user.id)) } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ]);
    const summary = transactions[0] || { totalIncome: 0, totalExpenses: 0 };
    summary.balance = summary.totalIncome - summary.totalExpenses;
    console.log('GET /api/transactions/summary:', summary);
    res.json(summary);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get spending trends (monthly expenses)
router.get('/trends', auth, async (req, res) => {
  try {
    const transactions = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(sanitize(req.user.id)), type: 'expense' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          total: 1,
          _id: 0,
        },
      },
    ]);
    console.log('GET /api/transactions/trends:', transactions);
    res.json(transactions);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export transactions as CSV
router.get('/export', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: sanitize(req.user.id) }).sort({ date: -1 });
    console.log('GET /api/transactions/export:', transactions);
    const headers = ['Date,Amount,Type,Category,Description'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.amount.toFixed(2),
      t.type,
      t.category,
      t.description || 'No description',
    ].join(','));
    const csvContent = [...headers, ...rows].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;