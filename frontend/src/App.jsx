import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Button, Box } from '@mui/material';
import BookingForm from './components/BookingForm';
import VerifyOtp from './components/VerifyOtp';
import Confirmation from './components/Confirmation';
import HairArtistLogin from './components/HairArtistLogin';
import HairArtistDashboard from './components/HairArtistDashboard';
import HairArtistManagement from './components/HairArtistManagement';

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

function Header() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/hair-artist/login';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Salon Booking System
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        component={Link}
        to={isLoginPage ? "/" : "/hair-artist/login"}
      >
        {isLoginPage ? "Book an Appointment" : "Login as Hair Artist"}
      </Button>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="md">
          <Header />
          <Routes>
            <Route path="/" element={<BookingForm />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/hair-artist/login" element={<HairArtistLogin />} />
            <Route path="/hair-artist/dashboard" element={<HairArtistDashboard />} />
            <Route path="/hair-artist/manage" element={<HairArtistManagement />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 