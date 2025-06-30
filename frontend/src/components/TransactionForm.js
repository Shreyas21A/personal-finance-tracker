import React, { useState } from 'react';
import axios from 'axios';

function TransactionForm({ onAddTransaction }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/transactions',
        { amount, category, description, type },
        { headers: { 'x-auth-token': token } }
      );
      onAddTransaction(res.data);
      setAmount('');
      setCategory('');
      setDescription('');
      setType('expense');
    } catch (error) {
      console.error(error.response.data);
      alert('Failed to add transaction: ' + error.response.data.message);
    }
  };

  return (
    <div className="container">
      <h3>Add Transaction</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default TransactionForm;
