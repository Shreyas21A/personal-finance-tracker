import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Box, Typography, List, ListItem, Card, CardContent, Button, Select, MenuItem, FormControl, InputLabel, TextField, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const [transRes, catRes] = await Promise.all([
          axios.get('http://localhost:5000/api/transactions', {
            headers: { 'x-auth-token': token },
          }),
          axios.get('http://localhost:5000/api/categories', {
            headers: { 'x-auth-token': token },
          }),
        ]);
        let sortedTransactions = [...transRes.data];
        
        if (filterType !== 'all') {
          sortedTransactions = sortedTransactions.filter(t => t.type === filterType);
        }

        sortedTransactions.sort((a, b) => {
          if (sortBy === 'date') {
            return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
          } else if (sortBy === 'amount') {
            return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
          } else if (sortBy === 'category') {
            return sortOrder === 'asc' ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
          }
          return 0;
        });

        setTransactions(sortedTransactions);
        setCategories(catRes.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          alert('Failed to fetch transactions: ' + (error.response?.data?.message || 'Server error'));
        }
      }
    };
    fetchData();
  }, [sortBy, sortOrder, filterType, navigate]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setTransactions(transactions.filter((transaction) => transaction._id !== id));
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to delete transaction: ' + (error.response?.data?.message || 'Server error'));
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction({ ...transaction, date: new Date(transaction.date) });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await axios.put(
        `http://localhost:5000/api/transactions/${editingTransaction._id}`,
        editingTransaction,
        { headers: { 'x-auth-token': token } }
      );
      setTransactions(
        transactions.map((t) => (t._id === res.data._id ? res.data : t))
      );
      setEditingTransaction(null);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to update transaction: ' + (error.response?.data?.message || 'Server error'));
      }
    }
  };

  const handleEditChange = (e) => {
    setEditingTransaction({ ...editingTransaction, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Transactions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Order</InputLabel>
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {editingTransaction && (
        <Card sx={{ mb: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h6">Edit Transaction</Typography>
            <Box component="form" onSubmit={handleUpdate}>
              <TextField
                label="Amount"
                type="number"
                name="amount"
                value={editingTransaction.amount}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
                variant="outlined"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={editingTransaction.category}
                  onChange={handleEditChange}
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
                name="description"
                value={editingTransaction.description}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={editingTransaction.type}
                  onChange={handleEditChange}
                >
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                </Select>
              </FormControl>
              <DatePicker
                selected={editingTransaction.date}
                onChange={(date) => setEditingTransaction({ ...editingTransaction, date })}
                dateFormat="MM/dd/yyyy"
                customInput={<TextField fullWidth margin="normal" label="Date" variant="outlined" />}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button type="submit" variant="contained" color="secondary" startIcon={<EditIcon />}>
                  Update
                </Button>
                <Button variant="outlined" onClick={() => setEditingTransaction(null)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {transactions.map((transaction) => (
          <ListItem key={transaction._id} disablePadding>
            <Card sx={{ width: '100%', minHeight: 80, bgcolor: transaction.amount > 100 ? '#ffebee' : 'inherit' }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box>
                  <Typography variant="body1">
                    {transaction.description || 'No description'} - <strong>${transaction.amount.toFixed(2)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.category}, {transaction.type} - {new Date(transaction.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(transaction)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(transaction._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default TransactionList;