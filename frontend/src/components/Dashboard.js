import React from 'react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

function Dashboard() {
  const handleAddTransaction = (transaction) => {
    // Update state in TransactionList via useEffect
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <TransactionForm onAddTransaction={handleAddTransaction} />
      <TransactionList />
    </div>
  );
}

export default Dashboard;