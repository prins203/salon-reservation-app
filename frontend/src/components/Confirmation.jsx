import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Confirmation = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Box sx={{ my: 4 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main' }} />
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Your appointment has been successfully booked. We've sent a confirmation email with all the details.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Book Another Appointment
        </Button>
      </Paper>
    </Container>
  );
};

export default Confirmation; 