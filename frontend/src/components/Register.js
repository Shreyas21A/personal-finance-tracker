import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Card, CardContent, Alert } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function Register({ setIsAuthenticated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      setIsAuthenticated(true);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <PersonAddIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Register
            </Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                sx={{ mt: 2 }}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Register;