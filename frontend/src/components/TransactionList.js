import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        let sortedTransactions = [...transRes.data].map(t => ({ ...t, id: t._id }));
        if (filterCategory) {
        sortedTransactions = sortedTransactions.filter(t => t.category === filterCategory);
        }
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sortBy, sortOrder, filterType, filterCategory, navigate]);

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
        transactions.map((t) => (t._id === res.data._id ? { ...res.data, id: res.data._id } : t))
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

  const handleExportCSV = () => {
    const headers = ['Date,Amount,Type,Category,Description'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.amount.toFixed(2),
      t.type,
      t.category,
      t.description || 'No description',
    ].join(','));
    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { field: 'date', headerName: 'Date', width: 150, valueFormatter: ({ value }) => new Date(value).toLocaleDateString() },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: ({ value }) => (
        <Typography color={value >= 100 ? 'error.main' : 'inherit'}>
          ${value.toFixed(2)}
        </Typography>
      ),
    },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'description', headerName: 'Description', width: 200, valueGetter: ({ value }) => value || 'No description' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => handleEdit(row)}
            aria-label={`Edit transaction ${row._id}`}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(row._id)}
            aria-label={`Delete transaction ${row._id}`}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h1" sx={{ mb: 4, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
          Transactions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort transactions by">
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="category">Category</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} aria-label="Sort order">
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Filter</InputLabel>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} aria-label="Filter transactions">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            aria-label="Export transactions as CSV"
          >
            Export to CSV
          </Button>
        </Box>
        {loading ? (
          <CircularProgress />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <DataGrid
              rows={transactions}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoHeight
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-row': {
                  '&:hover': { backgroundColor: 'background.paper' },
                },
              }}
            />
          </motion.div>
        )}
        <Dialog open={!!editingTransaction} onClose={() => setEditingTransaction(null)}>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
              <TextField
                label="Amount"
                type="number"
                name="amount"
                value={editingTransaction?.amount || ''}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                inputProps={{ min: 0 }}
                aria-label="Transaction amount"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={editingTransaction?.category || ''}
                  onChange={handleEditChange}
                  required
                  aria-label="Transaction category"
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
                value={editingTransaction?.description || ''}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                variant="outlined"
                aria-label="Transaction description"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={editingTransaction?.type || ''}
                  onChange={handleEditChange}
                  aria-label="Transaction type"
                >
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                </Select>
              </FormControl>
              <DatePicker
                selected={editingTransaction?.date}
                onChange={(date) => setEditingTransaction({ ...editingTransaction, date })}
                dateFormat="MM/dd/yyyy"
                customInput={<TextField fullWidth margin="normal" label="Date" variant="outlined" aria-label="Transaction date" />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingTransaction(null)} aria-label="Cancel edit">Cancel</Button>
            <Button type="submit" onClick={handleUpdate} variant="contained" color="secondary" aria-label="Update transaction">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
}

export default TransactionList;