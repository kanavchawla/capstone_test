// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6F00', // Swiggy-like orange color
    },
    secondary: {
      main: '#388E3C', // Complementary green color
    },
    background: {
      default: '#FFF8E1', // Light background
    },
    text: {
      primary: '#333',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

export default theme;
