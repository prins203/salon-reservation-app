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
import ServiceManagement from './components/ServiceManagement';
import { AuthProvider } from './context/AuthContext';

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
  const isHomePage = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Salon Booking System
      </Typography>
      <Box>
        {isHomePage && (
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/hair-artist/login"
            sx={{ mr: 2 }}
          >
            Login as Hair Artist
          </Button>
        )}
        {isLoginPage && (
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/"
          >
            Book an Appointment
          </Button>
        )}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
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
              <Route path="/hair-artist/services" element={<ServiceManagement />} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 