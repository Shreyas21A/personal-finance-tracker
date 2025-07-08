import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, IconButton, Alert, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function TransactionList({ filterCategory, setFilterCategory }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();
  const theme = useTheme();

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
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete transaction');
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
            onClick={() => navigate(`/edit-transaction/${params.row.id}`)}
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
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
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
      </Box>
    </motion.div>
  );
}

export default TransactionList;