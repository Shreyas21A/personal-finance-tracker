import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import { useNavigate } from 'react-router-dom';

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
          },
        ],
      });
      setError(null);
    } catch (error) {
      console.error('Fetch chart data error:', error);
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
      console.error('Fetch summary error:', error);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <button
        style={{ position: 'absolute', top: '10px', right: '10px' }}
        onClick={handleLogout}
      >
        Logout
      </button>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <div className="summary">
        <h3>Summary</h3>
        <p>Total Income: ${summary.totalIncome}</p>
        <p>Total Expenses: ${summary.totalExpenses}</p>
        <p>Balance: ${summary.balance}</p>
      </div>
      <div className="chart-container">
        {chartData.labels.length > 0 ? (
          <Pie data={chartData} />
        ) : (
          <p>No expense data available. Add some transactions!</p>
        )}
      </div>
      <TransactionForm onAddTransaction={handleAddTransaction} />
      <TransactionList />
    </div>
  );
}

export default Dashboard;
