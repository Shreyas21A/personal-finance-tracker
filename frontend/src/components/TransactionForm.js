import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TextField, Select, MenuItem, Button, Box, Typography, FormControl, InputLabel, Card, CardContent, Alert, Grid, CircularProgress } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function TransactionForm({ onAddTransaction }) {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      amount: '',
      category: '',
      description: '',
      type: 'expense',
      date: new Date(),
    },
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:5000/api/categories', {
          headers: { 'x-auth-token': token },
        });
        setCategories(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to fetch categories: ' + (error.response?.data?.message || 'Server error'));
        }
      }
    };
    fetchCategories();
  }, [navigate]);

const onSubmit = async (data) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const payload = {
      ...data,
      date: data.date.toISOString(), // Convert date to ISO string
    };
    const res = await axios.post(
      'http://localhost:5000/api/transactions',
      payload,
      { headers: { 'x-auth-token': token } }
    );
    onAddTransaction(res.data);
    reset();
    setError(null);
  } catch (error) {
    if (error.response?.status === 401) {
      navigate('/login');
    } else {
      setError('Failed to add transaction: ' + (error.response?.data?.message || 'Server error'));
    }
  }
};

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card sx={{ maxWidth: 500, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AddCircleIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h6">Add Transaction</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select {...field} aria-label="Transaction type">
                        <MenuItem value="expense">Expense</MenuItem>
                        <MenuItem value="income">Income</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="MM/dd/yyyy"
                      customInput={<TextField fullWidth label="Date" variant="outlined" aria-label="Transaction date" />}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddCircleIcon />}
                  aria-label="Add transaction"
                >
                  {isSubmitting ? 'Adding...' : 'Add Transaction'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TransactionForm;