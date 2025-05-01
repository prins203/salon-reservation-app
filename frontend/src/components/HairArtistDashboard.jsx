import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, List, ListItem, ListItemText, CircularProgress, Button, AppBar, Toolbar, IconButton } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { hairArtistService } from '../api/services/hairArtistService';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';

function HairArtistDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = localStorage.getItem('selectedDate');
    return savedDate ? new Date(savedDate) : new Date();
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    localStorage.removeItem('selectedDate');
    navigate('/hair-artist/login');
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');

      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const data = await hairArtistService.getBookings(formattedDate);
        setBookings(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    localStorage.setItem('selectedDate', newDate.toISOString());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hair Artist Dashboard
          </Typography>
          {currentUser?.is_admin && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/hair-artist/manage')}
                sx={{ mr: 2 }}
              >
                Manage Hair Artists
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/hair-artist/services')}
                sx={{ mr: 2 }}
              >
                Manage Services
              </Button>
            </>
          )}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            sx={{ mb: 3 }}
          />
        </LocalizationProvider>

        <Typography variant="h6" gutterBottom>
          Appointments for {formatDate(selectedDate)}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : bookings.length === 0 ? (
          <Typography>No appointments scheduled for this date.</Typography>
        ) : (
          <List>
            {bookings.map((booking) => (
              <ListItem key={booking.id} divider>
                <ListItemText
                  primary={`${booking.name} - ${booking.service}`}
                  secondary={`Time: ${booking.time}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Container>
    </Box>
  );
}

export default HairArtistDashboard; 