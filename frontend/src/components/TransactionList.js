import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: { 'x-auth-token': token },
        });
        setTransactions(res.data);
      } catch (error) {
        console.error(error.response.data);
        alert('Failed to fetch transactions: ' + error.response.data.message);
      }
    };
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setTransactions(transactions.filter((transaction) => transaction._id !== id));
    } catch (error) {
      console.error(error.response.data);
      alert('Failed to delete transaction: ' + error.response.data.message);
    }
  };

  return (
    <div className="container">
      <h3>Transactions</h3>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction._id}>
            {transaction.description} - ${transaction.amount} ({transaction.category}, {transaction.type})
            <button onClick={() => handleDelete(transaction._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
