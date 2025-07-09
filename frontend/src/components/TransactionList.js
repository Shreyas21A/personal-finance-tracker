import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, IconButton, Alert, useTheme, Dialog, DialogContent, DialogTitle, DialogActions, TextField, CircularProgress, Card, Grid, Tooltip } from '@mui/material';
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
import { format, isValid } from 'date-fns';

function TransactionList({ filterCategory, setFilterCategory, transactions, setTransactions }) {
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
    if (!dateString) {
      console.warn('Missing date:', dateString);
      return 'N/A';
    }
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        console.warn('Invalid date:', dateString);
        return 'N/A';
      }
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      console.error('Date parsing error:', e, dateString);
      return 'N/A';
    }
  };

  const exportToCsv = () => {
    const headers = ['Date,Type,Category,Amount,Description'];
    const rows = transactions.map((t) => [
      t.formattedDate || formatDate(t.date),
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
      date: transaction.date ? new Date(transaction.date) : new Date(),
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
        { ...data, date: data.date.toISOString() },
        { headers: { 'x-auth-token': token } }
      );
      console.log('Submitting edited data:', { ...data, date: data.date.toISOString() });
      console.log('Updated transaction response:', updatedTransaction.data);
      setTransactions(transactions.map((t) => (t.id === transactionToEdit.id ? {
        ...updatedTransaction.data,
        id: updatedTransaction.data._id,
        formattedDate: formatDate(updatedTransaction.data.date)
      } : t)));
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
        console.log('API Transactions:', transRes.data);
        let sortedTransactions = [...transRes.data].map(t => ({
          ...t,
          id: t._id,
          date: t.date,
          formattedDate: formatDate(t.date),
        }));

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

        console.log('Transformed Transactions:', sortedTransactions.map(t => ({ id: t.id, date: t.date, formattedDate: t.formattedDate })));
        setTransactions(sortedTransactions);
        setCategories(catRes.data);
        setError(null);
      } catch (error) {
        console.error('Fetch error:', error);
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
  }, [filterCategory, filterType, sortBy, sortOrder, navigate]);

  const columns = [
    {
      field: 'formattedDate',
      headerName: 'Date',
      width: 120,
    },
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
          <Tooltip title="Edit transaction">
            <IconButton
              color="primary"
              onClick={() => handleEdit(params.row)}
              aria-label={`Edit transaction ${params.row.description}`}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete transaction">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
              aria-label={`Delete transaction ${params.row.description}`}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }} aria-label="Transactions section title">Transactions</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
        <Card sx={{ p: 2, mb: 2, backgroundColor: theme.palette.primary.light, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {filterCategory && (
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ mr: 1, color: theme.palette.primary.dark, borderBottom: `2px solid ${theme.palette.primary.main}` }}
                      aria-describedby="category-filter"
                    >
                      Filtered by: {filterCategory}
                    </Typography>
                    <Tooltip title="Clear category filter">
                      <IconButton
                        color="secondary"
                        onClick={() => setFilterCategory(null)}
                        aria-label="Clear category filter"
                        sx={{ fontSize: '1.5rem' }}
                      >
                        <ClearIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </motion.div>
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                }}
              >
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort transactions by"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                }}
              >
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-label="Sort order"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                }}
              >
                <InputLabel>Filter Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  aria-label="Filter transactions by type"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<FileDownloadIcon />}
                  onClick={exportToCsv}
                  aria-label="Export transactions to CSV"
                  sx={{ borderRadius: 2 }}
                >
                  Export CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
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
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="sm"
          fullWidth
          component={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <DialogTitle sx={{ typography: 'h6', color: theme.palette.primary.main, p: 3 }}>
            Edit Transaction
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit(onEditSubmit)}>
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
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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