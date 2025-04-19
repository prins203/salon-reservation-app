import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    // Check if we have the required state data
    if (!location.state?.contact || !location.state?.name || !location.state?.service || 
        !location.state?.date || !location.state?.time || !location.state?.hair_artist_id) {
        return (
            <Paper elevation={3} className="form-container">
                <Typography variant="h4" component="h2" gutterBottom>
                    Error
                </Typography>
                <Typography variant="body1" color="error" paragraph>
                    Missing booking information. Please start over.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Go Back
                </Button>
            </Paper>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await axios.post('http://localhost:8000/api/verify-otp', {
                contact: location.state.contact,
                code: otp,
                name: location.state.name,
                service: location.state.service,
                date: location.state.date,
                time: location.state.time,
                hair_artist_id: location.state.hair_artist_id
            });
            
            if (response.data.booking_id) {
                navigate('/confirmation', { 
                    state: { 
                        bookingId: response.data.booking_id,
                        name: location.state.name,
                        service: location.state.service,
                        date: location.state.date,
                        time: location.state.time
                    } 
                });
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            if (error.response?.data?.detail === "This time slot is no longer available") {
                setError('This time slot is no longer available. Please go back and select a different time.');
            } else {
                setError('Invalid OTP. Please try again.');
            }
        }
    };

    return (
        <Paper elevation={3} className="form-container">
            <Typography variant="h4" component="h2" gutterBottom>
                Verify Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                We've sent a 6-digit OTP to your email address. Please enter it below.
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="OTP"
                    required
                    inputProps={{ maxLength: 6, pattern: "[0-9]{6}" }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    margin="normal"
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Verify OTP
                </Button>
            </Box>
        </Paper>
    );
};

export default VerifyOtp; 