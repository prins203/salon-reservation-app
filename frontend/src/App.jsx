import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Button, Box } from '@mui/material';

// Store
import store from './redux/store';

// Components
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

// Simplified Header component to prevent Redux state issues
function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use a simpler approach to detect auth state to avoid circular dependencies
  const hasToken = localStorage.getItem('token') !== null;
  
  const isLoginPage = location.pathname === '/hair-artist/login';
  const isHomePage = location.pathname === '/';
  
  // Handle logout without using Redux dispatch directly
  const handleLogout = () => {
    // Just remove token and redirect
    localStorage.removeItem('token');
    navigate('/hair-artist/login');
  };

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
        {hasToken && !isHomePage && !isLoginPage && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            sx={{ mr: 2 }}
          >
            Logout
          </Button>
        )}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Toast Notification Container */}
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <AuthProvider>
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
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </Provider>
  );
}

export default App; 