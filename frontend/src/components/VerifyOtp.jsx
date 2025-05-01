import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { bookingService } from '../api/services';
import { format } from 'date-fns';

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(location.state || {});
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Ensure booking data has default values for required fields
  useEffect(() => {
    // If no booking data or missing date, set defaults
    if (!bookingData || !bookingData.date) {
      setBookingData(prevData => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return {
          ...prevData,
          date: today,
          // Set other defaults if needed
          time: prevData.time || '',
          name: prevData.name || '',
          service: prevData.service || '',
          gender: prevData.gender || 'male',
          hair_artist_id: prevData.hair_artist_id || 1
        };
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Get today's date as a fallback
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Send all booking data along with the OTP
      const otpData = {
        contact: bookingData.contact,
        code: otp,
        name: bookingData.name,
        service: bookingData.service,
        date: bookingData.date || today, // Use today as fallback
        time: bookingData.time || '10:00', // Use default time as fallback
        hair_artist_id: bookingData.hair_artist_id,
        gender: bookingData.gender
      };
      
      const response = await bookingService.verifyOtp(otpData);
      if (response.message === "OTP verified successfully") {
        navigate('/confirmation', { state: { bookingId: response.booking_id } });
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map(error => error.msg).join(', '));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Verify OTP
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Typography variant="body1" sx={{ mb: 2 }}>
          Please enter the OTP sent to {bookingData?.contact}
        </Typography>

        <TextField
          fullWidth
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
        </Button>
      </Box>
    </Container>
  );
}

export default VerifyOtp; 