import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: { 'x-auth-token': token },
        });
        let sortedTransactions = [...res.data];
        
        // Apply filter
        if (filterType !== 'all') {
          sortedTransactions = sortedTransactions.filter(t => t.type === filterType);
        }

        // Apply sorting
        sortedTransactions.sort((a, b) => {
          if (sortBy === 'date') {
            return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
          } else if (sortBy === 'amount') {
            return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
          } else if (sortBy === 'category') {
            return sortOrder === 'asc' ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
          }
          return 0;
        });

        setTransactions(sortedTransactions);
      } catch (error) {
        console.error(error.response.data);
        alert('Failed to fetch transactions: ' + error.response.data.message);
      }
    };
    fetchTransactions();
  }, [sortBy, sortOrder, filterType]);

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

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/transactions/${editingTransaction._id}`,
        editingTransaction,
        { headers: { 'x-auth-token': token } }
      );
      setTransactions(
        transactions.map((t) => (t._id === res.data._id ? res.data : t))
      );
      setEditingTransaction(null);
    } catch (error) {
      console.error(error.response.data);
      alert('Failed to update transaction: ' + error.response.data.message);
    }
  };

  const handleEditChange = (e) => {
    setEditingTransaction({ ...editingTransaction, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h3>Transactions</h3>
      <div>
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="category">Category</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <label> Filter: </label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      {editingTransaction && (
        <div>
          <h4>Edit Transaction</h4>
          <form onSubmit={handleUpdate}>
            <input
              type="number"
              name="amount"
              value={editingTransaction.amount}
              onChange={handleEditChange}
              required
            />
            <input
              type="text"
              name="category"
              value={editingTransaction.category}
              onChange={handleEditChange}
              required
            />
            <input
              type="text"
              name="description"
              value={editingTransaction.description}
              onChange={handleEditChange}
            />
            <select name="type" value={editingTransaction.type} onChange={handleEditChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditingTransaction(null)}>Cancel</button>
          </form>
        </div>
      )}
      <ul>
        {transactions.map((transaction) => (
          <li
            key={transaction._id}
            style={{ backgroundColor: transaction.amount > 100 ? '#ffcccc' : 'transparent' }}
          >
            {transaction.description || 'No description'} - ${transaction.amount} ({transaction.category}, {transaction.type}) - {new Date(transaction.date).toLocaleDateString()}
            <div>
              <button onClick={() => handleEdit(transaction)}>Edit</button>
              <button onClick={() => handleDelete(transaction._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
