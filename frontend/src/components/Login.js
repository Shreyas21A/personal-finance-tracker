import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Card, CardContent, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <LockIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Login
            </Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
                Sign In
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Login;