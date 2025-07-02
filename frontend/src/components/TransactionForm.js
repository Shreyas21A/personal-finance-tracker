import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TextField, Select, MenuItem, Button, Box, Typography, FormControl, InputLabel } from '@mui/material';

function TransactionForm({ onAddTransaction }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date());
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/categories', {
          headers: { 'x-auth-token': token },
        });
        setCategories(res.data);
      } catch (error) {
        console.error(error.response.data);
        alert('Failed to fetch categories: ' + (error.response?.data?.message || 'Server error'));
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/transactions',
        { amount, category, description, type, date },
        { headers: { 'x-auth-token': token } }
      );
      onAddTransaction(res.data);
      setAmount('');
      setCategory('');
      setDescription('');
      setType('expense');
      setDate(new Date());
    } catch (error) {
      console.error(error.response.data);
      alert('Failed to add transaction: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Add Transaction
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <MenuItem value="">Select Category</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="expense">Expense</MenuItem>
            <MenuItem value="income">Income</MenuItem>
          </Select>
        </FormControl>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat="MM/dd/yyyy"
          placeholderText="Select Date"
          customInput={<TextField fullWidth margin="normal" label="Date" />}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Add
        </Button>
      </Box>
    </Box>
  );
}

export default TransactionForm;