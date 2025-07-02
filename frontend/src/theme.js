import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00695c', // Teal
      light: '#4db6ac',
      dark: '#003d33',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f4511e', // Deep Orange
      light: '#ff8a50',
      dark: '#b91400',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5', // Light grey background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#00695c',
    },
    h6: {
      fontWeight: 500,
      color: '#00695c',
    },
    body1: {
      color: '#424242',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
  },
});

export default theme;