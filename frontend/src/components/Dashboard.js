import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { Box, Typography, Card, CardContent, Grid, Skeleton, Alert, useTheme, useMediaQuery, LinearProgress, IconButton, Button, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { motion } from 'framer-motion';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import BudgetForm from './BudgetForm';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

function Dashboard() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [trendsData, setTrendsData] = useState({ labels: [], datasets: [] });
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openBudgetForm, setOpenBudgetForm] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('md'));

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const [categoryRes, summaryRes, trendsRes, budgetsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/transactions/by-category', {
          headers: { 'x-auth-token': token },
        }),
        axios.get('http://localhost:5000/api/transactions/summary', {
          headers: { 'x-auth-token': token },
        }),
        axios.get('http://localhost:5000/api/transactions/trends', {
          headers: { 'x-auth-token': token },
        }),
        axios.get('http://localhost:5000/api/budgets', {
          headers: { 'x-auth-token': token },
        }),
      ]);
      console.log('Category API Response:', categoryRes.data);
      console.log('Trends API Response:', trendsRes.data);
      console.log('Summary API Response:', summaryRes.data);
      console.log('Budgets API Response:', budgetsRes.data);
      setChartData({
        labels: categoryRes.data.map(item => item._id || 'Uncategorized'),
        datasets: [
          {
            label: 'Spending by Category',
            data: categoryRes.data.map(item => item.total || 0),
            backgroundColor: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.primary.light, theme.palette.secondary.light, '#9966FF'],
            borderColor: theme.palette.background.paper,
            borderWidth: 2,
          },
        ],
      });
      setTrendsData({
        labels: trendsRes.data.map(item => item.month || 'Unknown'),
        datasets: [
          {
            label: 'Expenses Over Time',
            data: trendsRes.data.map(item => item.total || 0),
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
            fill: false,
          },
        ],
      });
      setSummary(summaryRes.data);
      setBudgets(budgetsRes.data);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handlePieClick = (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const category = chartData.labels[index];
      navigate(`/transactions?category=${encodeURIComponent(category)}`);
    }
  };

  const handleAddBudget = () => {
    fetchData();
    setOpenBudgetForm(false);
    setBudgetToEdit(null);
  };

  const handleEditBudget = (budget) => {
    setBudgetToEdit(budget);
    setOpenBudgetForm(true);
  };

  const handleOpenDeleteDialog = (budget) => {
    setBudgetToDelete(budget);
    setOpenDeleteDialog(true);
  };

  const handleDeleteBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`http://localhost:5000/api/budgets/${budgetToDelete._id}`, {
        headers: { 'x-auth-token': token },
      });
      setSuccess(`Budget for ${budgetToDelete.category} deleted successfully!`);
      fetchData();
      setOpenDeleteDialog(false);
      setBudgetToDelete(null);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to delete budget');
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, mt: 8 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h1" align="center" sx={{ mb: 4, fontSize: { xs: '1.8rem', md: '2.2rem' } }} aria-label="Dashboard title">
          Dashboard
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', borderRadius: 2 }}>
                <CardContent>
                  {loading ? (
                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                  ) : (
                    <>
                      <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} aria-hidden="true" />
                      <Typography variant="h6" color="textSecondary">Total Income</Typography>
                      <Typography variant="h4" color="primary">${summary.totalIncome.toFixed(2)}</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', borderRadius: 2 }}>
                <CardContent>
                  {loading ? (
                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                  ) : (
                    <>
                      <TrendingDownIcon color="error" sx={{ fontSize: 40, mb: 1 }} aria-hidden="true" />
                      <Typography variant="h6" color="textSecondary">Total Expenses</Typography>
                      <Typography variant="h4" color="error">${summary.totalExpenses.toFixed(2)}</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', borderRadius: 2 }}>
                <CardContent>
                  {loading ? (
                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                  ) : (
                    <>
                      <AccountBalanceIcon color={summary.balance >= 0 ? 'success' : 'error'} sx={{ fontSize: 40, mb: 1 }} aria-hidden="true" />
                      <Typography variant="h6" color="textSecondary">Balance</Typography>
                      <Typography variant="h4" color={summary.balance >= 0 ? 'success.main' : 'error.main'}>
                        ${summary.balance.toFixed(2)}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Card sx={{ p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BarChartIcon color="primary" sx={{ mr: 1, fontSize: 32 }} aria-hidden="true" />
                    <Typography variant="h6">Spending by Category</Typography>
                  </Box>
                  {loading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : chartData.labels.length > 0 ? (
                    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                      <Pie
                        data={chartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: 'top', labels: { font: { size: 14 } } },
                            tooltip: { enabled: true },
                            title: { display: true, text: 'Spending by Category', font: { size: 18 } },
                          },
                          onClick: handlePieClick,
                        }}
                        aria-label="Spending by category pie chart"
                      />
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography>No expense data available.</Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate('/transactions')}
                        sx={{ mt: 2, borderRadius: 2 }}
                        aria-label="Go to transactions page to add transactions"
                      >
                        Add Transactions
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Card sx={{ p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BarChartIcon color="primary" sx={{ mr: 1, fontSize: 32 }} aria-hidden="true" />
                    <Typography variant="h6">Expenses Over Time</Typography>
                  </Box>
                  {loading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : trendsData.labels.length > 0 ? (
                    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                      <Line
                        data={trendsData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: 'top', labels: { font: { size: 14 } } },
                            title: { display: true, text: 'Expenses Over Time', font: { size: 18 } },
                          },
                          scales: {
                            x: { title: { display: true, text: 'Month' } },
                            y: { title: { display: true, text: 'Amount ($)' } },
                          },
                        }}
                        aria-label="Expenses over time line chart"
                      />
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography>No expense data available.</Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate('/transactions')}
                        sx={{ mt: 2, borderRadius: 2 }}
                        aria-label="Go to transactions page to add transactions"
                      >
                        Add Transactions
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <Card sx={{ p: 3, background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AddCircleIcon color="primary" sx={{ mr: 1, fontSize: 32 }} aria-hidden="true" />
                    <Typography variant="h6">Budgets</Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<AddCircleIcon />}
                      onClick={() => setOpenBudgetForm(true)}
                      sx={{ ml: 'auto', borderRadius: 2 }}
                      aria-label="Open set budget form"
                    >
                      Add Budget
                    </Button>
                  </Box>
                  {loading ? (
                    <Skeleton variant="rectangular" height={100} />
                  ) : budgets.length > 0 ? (
                    budgets.map(budget => (
                      <Box key={budget._id} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">{budget.category}: ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(budget.spent / budget.amount) * 100}
                            color={budget.spent > budget.amount ? 'error' : 'primary'}
                            sx={{ height: 10, borderRadius: 5 }}
                            aria-label={`Budget progress for ${budget.category}`}
                          />
                        </Box>
                        <Box>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditBudget(budget)}
                            aria-label={`Edit budget for ${budget.category}`}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(budget)}
                            aria-label={`Delete budget for ${budget.category}`}
                            title="Delete budget"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography>No budgets set. Add a budget!</Typography>
                  )}
                </CardContent>
              </Card>
              <Dialog open={openBudgetForm} onClose={() => { setOpenBudgetForm(false); setBudgetToEdit(null); }} maxWidth="sm" fullWidth>
                <DialogContent>
                  <BudgetForm onAddBudget={handleAddBudget} budgetToEdit={budgetToEdit} />
                </DialogContent>
              </Dialog>
              <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="sm"
                fullWidth
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <DialogTitle sx={{ typography: 'h6', color: theme.palette.primary.main, p: 3 }}>
                  Confirm Delete Budget
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                  <Typography variant="body1">
                    Are you sure you want to delete the budget for {budgetToDelete?.category}?
                  </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth={isMobile}
                    onClick={() => setOpenDeleteDialog(false)}
                    aria-label="Cancel budget deletion"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth={isMobile}
                    onClick={handleDeleteBudget}
                    aria-label="Confirm budget deletion"
                    title="Confirm budget deletion"
                  >
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}

export default Dashboard;