import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';

const HairArtistDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/hair-artist/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch user info to check if admin
        const userResponse = await axios.get('http://localhost:8000/api/hair-artists/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAdmin(userResponse.data.is_admin);

        // Fetch appointments for selected date
        const dateStr = selectedDate.toISOString().split('T')[0];
        const appointmentsResponse = await axios.get(`http://localhost:8000/api/bookings?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(appointmentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          navigate('/hair-artist/login');
        } else {
          setError('Failed to load data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, selectedDate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/hair-artist/login');
  };

  const handleManageHairArtists = () => {
    navigate('/hair-artist/manage');
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hair Artist Dashboard
          </Typography>
          {isAdmin && (
            <Button
              color="inherit"
              startIcon={<PeopleIcon />}
              onClick={handleManageHairArtists}
            >
              Manage Hair Artists
            </Button>
          )}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Appointments for {formatDate(selectedDate)}
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Box>
          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : appointments.length === 0 ? (
            <Typography>No appointments for this day</Typography>
          ) : (
            <List>
              {appointments.map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${appointment.name} - ${appointment.service}`}
                      secondary={`Time: ${new Date(appointment.datetime).toLocaleTimeString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default HairArtistDashboard; 