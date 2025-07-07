import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Box, useMediaQuery } from '@mui/material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Categories from './components/Categories';
import TransactionList from './components/TransactionList';
import theme from './theme';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const themeInstance = useTheme();
  const isMobile = !useMediaQuery(themeInstance.breakpoints.up('md'));

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.get('http://localhost:5000/api/auth/validate', {
            headers: { 'x-auth-token': token },
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <motion.div initial={{ x: 250 }} animate={{ x: 0 }} transition={{ duration: 0.3 }}>
      <Box sx={{ width: 250, p: 2 }}>
        <Typography variant="h6" sx={{ p: 2, color: themeInstance.palette.primary.main }}>
          Finance Tracker
        </Typography>
        <List>
          {isAuthenticated ? (
            <>
              <ListItem button component={Link} to="/dashboard" onClick={handleDrawerToggle}>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button component={Link} to="/transactions" onClick={handleDrawerToggle}>
                <ListItemText primary="Transactions" />
              </ListItem>
              <ListItem button component={Link} to="/categories" onClick={handleDrawerToggle}>
                <ListItemText primary="Categories" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button component={Link} to="/login" onClick={handleDrawerToggle}>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button component={Link} to="/register" onClick={handleDrawerToggle}>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </motion.div>
  );

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed" sx={{ background: `linear-gradient(to right, ${themeInstance.palette.primary.main}, ${themeInstance.palette.primary.dark})` }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            component={Link}
            to={isAuthenticated ? "/dashboard" : "/login"}
            aria-label="Navigate to home"
          >
            <AccountBalanceWalletIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Finance Tracker
          </Typography>
          {isMobile ? (
            <IconButton color="inherit" onClick={handleDrawerToggle} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              {isAuthenticated ? (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/dashboard"
                    sx={{ mx: 1, '&:hover': { backgroundColor: themeInstance.palette.primary.light } }}
                    aria-label="Navigate to dashboard"
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/transactions"
                    sx={{ mx: 1, '&:hover': { backgroundColor: themeInstance.palette.primary.light } }}
                    aria-label="Navigate to transactions"
                  >
                    Transactions
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/categories"
                    sx={{ mx: 1, '&:hover': { backgroundColor: themeInstance.palette.primary.light } }}
                    aria-label="Navigate to categories"
                  >
                    Categories
                  </Button>
                  <Button
                    color="secondary"
                    onClick={handleLogout}
                    sx={{ mx: 1, '&:hover': { backgroundColor: themeInstance.palette.secondary.light } }}
                    aria-label="Logout"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/login"
                    sx={{ mx: 1, '&:hover': { backgroundColor: themeInstance.palette.primary.light } }}
                    aria-label="Navigate to login"
                  >
                    Login
                  </Button>
                  <Button
                    color="secondary"
                    component={Link}
                    to="/register"
                    sx={{ mx: 1, '&:hover': { backgroundColor: themeInstance.palette.secondary.light } }}
                    aria-label="Navigate to register"
                  >
                    Register
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
      <Box sx={{ mt: 8, p: { xs: 2, md: 4 } }}>
        <AnimatePresence>
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionList />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Box>
    </ThemeProvider>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}