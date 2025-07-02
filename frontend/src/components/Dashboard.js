import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Grid, Alert } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const navigate = useNavigate();

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view the dashboard');
        navigate('/login');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/transactions/by-category', {
        headers: { 'x-auth-token': token },
      });
      const labels = res.data.map(item => item._id);
      const data = res.data.map(item => item.total);
      setChartData({
        labels,
        datasets: [
          {
            label: 'Spending by Category',
            data,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      });
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch chart data');
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/transactions/summary', {
        headers: { 'x-auth-token': token },
      });
      setSummary(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch summary');
    }
  };

  useEffect(() => {
    fetchChartData();
    fetchSummary();
  }, []);

  const handleAddTransaction = () => {
    fetchChartData();
    fetchSummary();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Dashboard
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography>Total Income: ${summary.totalIncome.toFixed(2)}</Typography>
              <Typography>Total Expenses: ${summary.totalExpenses.toFixed(2)}</Typography>
              <Typography>Balance: ${summary.balance.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                {chartData.labels.length > 0 ? (
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <Typography>No expense data available. Add some transactions!</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TransactionList />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;