import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import BookingForm from './components/BookingForm';
import VerifyOtp from './components/VerifyOtp';
import Confirmation from './components/Confirmation';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app-container">
          <Container maxWidth="sm">
            <Typography variant="h3" component="h1" align="center" gutterBottom>
              Salon Booking System
            </Typography>
            <Routes>
              <Route path="/" element={<BookingForm />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/confirmation" element={<Confirmation />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
