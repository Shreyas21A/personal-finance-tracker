import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/categories', {
          headers: { 'x-auth-token': token },
        });
        setCategories(res.data);
      } catch (error) {
        console.error(error.response.data);
        alert('Failed to fetch categories: ' + (error.response?.data?.message || 'Server error'));
      }
    };
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/categories',
        { name },
        { headers: { 'x-auth-token': token } }
      );
      setCategories([...categories, res.data]);
      setName('');
    } catch (error) {
      console.error(error.response.data);
      alert('Failed to add category: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setCategories(categories.filter((category) => category._id !== id));
    } catch (error) {
      console.error(error.response.data);
      alert('Failed to delete category: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Manage Categories
        </Typography>
        <Box component="form" onSubmit={handleAdd} sx={{ mb: 4 }}>
          <TextField
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" fullWidth>
            Add Category
          </Button>
        </Box>
        <List>
          {categories.map((category) => (
            <ListItem
              key={category._id}
              secondaryAction={
                <Button variant="contained" color="error" onClick={() => handleDelete(category._id)}>
                  Delete
                </Button>
              }
            >
              <ListItemText primary={category.name} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}

export default Categories;