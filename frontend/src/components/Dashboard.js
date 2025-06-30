import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('token');
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
      } catch (error) {
        console.error(error.response.data);
        alert('Failed to fetch chart data: ' + error.response.data.message);
      }
    };
    fetchChartData();
  }, []);

  const handleAddTransaction = () => {
    // Trigger chart data refresh
    fetchChartData();
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <div style={{ maxWidth: '400px', margin: '20px auto' }}>
        <Pie data={chartData} />
      </div>
      <TransactionForm onAddTransaction={handleAddTransaction} />
      <TransactionList />
    </div>
  );
}

export default Dashboard;
