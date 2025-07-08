import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { TextField, Grid, Select, MenuItem, Button, Box, Typography, FormControl, InputLabel, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function BudgetForm({ onAddBudget, budgetToEdit }) {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      category: budgetToEdit?.category || '',
      amount: budgetToEdit?.amount || '',
      period: budgetToEdit?.period || 'monthly',
    },
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const isEditing = !!budgetToEdit;

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
      let res;
      if (isEditing) {
        res = await axios.put(
          `http://localhost:5000/api/budgets/${budgetToEdit._id}`,
          data,
          { headers: { 'x-auth-token': token } }
        );
        setSuccess('Budget updated successfully!');
      } else {
        res = await axios.post(
          'http://localhost:5000/api/budgets',
          data,
          { headers: { 'x-auth-token': token } }
        );
        setSuccess('Budget created successfully!');
      }
      onAddBudget(res.data);
      reset({ category: '', amount: '', period: 'monthly' });
      setError(null);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} budget`);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card sx={{ maxWidth: 500, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {isEditing ? (
              <EditIcon color="primary" sx={{ mr: 1, fontSize: 32 }} aria-hidden="true" />
            ) : (
              <AddCircleIcon color="primary" sx={{ mr: 1, fontSize: 32 }} aria-hidden="true" />
            )}
            <Typography variant="h6">{isEditing ? 'Edit Budget' : 'Set Budget'}</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} aria-label="Budget category">
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
                  name="amount"
                  control={control}
                  rules={{ required: 'Amount is required', min: { value: 0, message: 'Amount must be positive' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Budget Amount"
                      type="number"
                      fullWidth
                      variant="outlined"
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                      aria-label="Budget amount"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="period"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Period</InputLabel>
                      <Select {...field} aria-label="Budget period">
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
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
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : isEditing ? <EditIcon /> : <AddCircleIcon />}
                  aria-label={isEditing ? 'Update budget' : 'Set budget'}
                >
                  {isSubmitting ? 'Processing...' : isEditing ? 'Update Budget' : 'Set Budget'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BudgetForm;