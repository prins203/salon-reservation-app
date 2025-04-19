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
    const { contact, name, service, datetime } = location.state || {};

    if (!contact || !name || !service || !datetime) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/verify-otp', {
                contact,
                code: otp,
                name,
                service,
                datetime
            });

            if (response.data.message === 'OTP verified successfully') {
                navigate('/confirmation');
            }
        } catch (error) {
            if (error.response?.data?.detail === "This time slot is no longer available") {
                setError('This time slot is no longer available. Please go back and select a different time.');
            } else {
                setError('Invalid OTP. Please try again.');
            }
            console.error('Error verifying OTP:', error);
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