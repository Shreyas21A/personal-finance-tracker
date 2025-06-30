const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Create transaction
router.post('/', auth, async (req, res) => {
  const { amount, category, description, type } = req.body;
  try {
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      category,
      description,
      type,
    });
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  const { amount, category, description, type } = req.body;
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { amount, category, description, type },
      { new: true }
    );
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transactions by category (for chart)
router.get('/by-category', auth, async (req, res) => {
  try {
    const transactions = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;