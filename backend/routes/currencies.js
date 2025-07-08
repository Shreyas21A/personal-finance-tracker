const express = require('express');
const router = express.Router();

// List of supported currencies
const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'INR', symbol: '₹' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
];

// Get available currencies
router.get('/', (req, res) => {
  res.json(currencies);
});

module.exports = router;