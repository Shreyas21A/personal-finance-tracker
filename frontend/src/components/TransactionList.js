import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Select, Grid, MenuItem, FormControl, InputLabel, Button, IconButton, Alert, useTheme, Dialog, DialogContent, DialogTitle, DialogActions, TextField, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function TransactionList({ filterCategory, setFilterCategory }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      amount: '',
      category: '',
      description: '',
      type: 'expense',
      date: new Date(),
    },
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const exportToCsv = () => {
    const headers = ['Date,Type,Category,Amount,Description'];
    const rows = transactions.map((t) => [
      formatDate(t.date),
      t.type,
      t.category,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
    ].join(','));
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setTransactions(transactions.filter((t) => t.id !== id));
      setSuccess('Transaction deleted successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction);
    reset({
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description || '',
      type: transaction.type,
      date: new Date(transaction.date),
    });
    setOpenEditDialog(true);
  };

  const onEditSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const updatedTransaction = await axios.put(
        `http://localhost:5000/api/transactions/${transactionToEdit.id}`,
        data,
        { headers: { 'x-auth-token': token } }
      );
      setTransactions(transactions.map((t) => (t.id === transactionToEdit.id ? { ...updatedTransaction.data, id: updatedTransaction.data._id } : t)));
      setSuccess('Transaction updated successfully!');
      setOpenEditDialog(false);
      setTransactionToEdit(null);
      reset({ amount: '', category: '', description: '', type: 'expense', date: new Date() });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to update transaction');
      }
    }
  };

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
          const aValue = a[sortBy] || 0;
          const bValue = b[sortBy] || 0;
          if (sortBy === 'date') {
            return sortOrder === 'asc' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
          }
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        setTransactions(sortedTransactions);
        setCategories(catRes.data);
        setError(null);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError(error.response?.data?.message || 'Failed to fetch transactions');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sortBy, sortOrder, filterType, filterCategory, navigate]);

  const columns = [
    { field: 'date', headerName: 'Date', width: 120, valueFormatter: ({ value }) => formatDate(value) },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'category', headerName: 'Category', width: 150 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 100, 
      renderCell: (params) => (
        <Typography color={params.row.type === 'expense' ? 'error' : 'success.main'}>
          ${params.value.toFixed(2)}
        </Typography>
      ),
    },
    { field: 'description', headerName: 'Description', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            aria-label={`Edit transaction ${params.row.description}`}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            aria-label={`Delete transaction ${params.row.description}`}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Transactions</Typography>
        {filterCategory && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              Filtered by: {filterCategory}
            </Typography>
            <IconButton
              color="primary"
              onClick={() => setFilterCategory(null)}
              aria-label="Clear category filter"
            >
              <ClearIcon />
            </IconButton>
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort transactions by"
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="category">Category</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="Sort order"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter transactions by type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FileDownloadIcon />}
            onClick={exportToCsv}
            aria-label="Export transactions to CSV"
          >
            Export CSV
          </Button>
        </Box>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={transactions}
            columns={columns}
            loading={loading}
            disableSelectionOnClick
            autoHeight
            aria-label="Transaction list"
            sx={{
              '& .MuiDataGrid-row': {
                backgroundColor: transactions.some(t => t.amount >= 100 && t.type === 'expense')
                  ? theme.palette.warning.light
                  : 'inherit',
              },
            }}
          />
        </Box>
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit(onEditSubmit)} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{ required: 'Amount is required', min: { value: 0, message: 'Amount must be positive' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Amount"
                        type="number"
                        fullWidth
                        variant="outlined"
                        error={!!errors.amount}
                        helperText={errors.amount?.message}
                        aria-label="Transaction amount"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.category}>
                        <InputLabel>Category</InputLabel>
                        <Select {...field} aria-label="Transaction category">
                          <MenuItem value="">Select Category</MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>
                          ))}
                        </Select>
                        {errors.category && <Typography color="error">{errors.category.message}</Typography>}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        variant="outlined"
                        aria-label="Transaction description"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Type is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.type}>
                        <InputLabel>Type</InputLabel>
                        <Select {...field} aria-label="Transaction type">
                          <MenuItem value="income">Income</MenuItem>
                          <MenuItem value="expense">Expense</MenuItem>
                        </Select>
                        {errors.type && <Typography color="error">{errors.type.message}</Typography>}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: 'Date is required' }}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Date"
                          value={field.value}
                          onChange={field.onChange}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={!!errors.date}
                              helperText={errors.date?.message}
                              aria-label="Transaction date"
                            />
                          )}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <EditIcon />}
                  aria-label="Update transaction"
                >
                  {isSubmitting ? 'Updating...' : 'Update Transaction'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => setOpenEditDialog(false)}
                  aria-label="Cancel edit"
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </motion.div>
  );
}

export default TransactionList;