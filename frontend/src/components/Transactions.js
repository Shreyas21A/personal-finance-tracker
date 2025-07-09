import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filterCategory, setFilterCategory] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setFilterCategory(category);
    } else {
      setFilterCategory(null);
    }
  }, [location.search]);

  const handleAddTransaction = (newTransaction) => {
    setTransactions((prev) => [
      {
        ...newTransaction,
        id: newTransaction._id,
        formattedDate: format(new Date(newTransaction.date), 'MMM d, yyyy'),
      },
      ...prev,
    ]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: { xs: 2, md: 4 }, mt: 8 }}>
        <Typography variant="h1" align="center" sx={{ mb: 4, fontSize: { xs: '1.8rem', md: '2.2rem' } }} aria-label="Transactions title">
          Transactions
        </Typography>
        <TransactionForm onAddTransaction={handleAddTransaction} />
        <TransactionList
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </Box>
    </motion.div>
  );
}

export default Transactions;