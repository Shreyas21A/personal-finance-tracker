import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, TextField, Button, List, ListItem, Card, CardContent, ListItemText } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:5000/api/categories', {
          headers: { 'x-auth-token': token },
        });
        setCategories(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          alert('Failed to fetch categories: ' + (error.response?.data?.message || 'Server error'));
        }
      }
    };
    fetchCategories();
  }, [navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await axios.post(
        'http://localhost:5000/api/categories',
        { name },
        { headers: { 'x-auth-token': token } }
      );
      setCategories([...categories, res.data]);
      setName('');
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to add category: ' + (error.response?.data?.message || 'Server error'));
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setCategories(categories.filter((category) => category._id !== id));
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to delete category: ' + (error.response?.data?.message || 'Server error'));
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Manage Categories
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CategoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Add Category</Typography>
          </Box>
          <Box component="form" onSubmit={handleAdd}>
            <TextField
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
            >
              Add Category
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          <List>
            {categories.map((category) => (
              <ListItem
                key={category._id}
                secondaryAction={
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(category._id)}
                  >
                    Delete
                  </Button>
                }
              >
                <ListItemText primary={category.name} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Categories;