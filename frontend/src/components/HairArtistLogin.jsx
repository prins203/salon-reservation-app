import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Box, Typography, CircularProgress, Paper } from '@mui/material';
import useAuth from '../hooks/useAuth';
import { showAuthError, showSuccess } from '../utils/notificationUtils';
import ErrorMessage from './shared/ErrorMessage';

function HairArtistLogin() {
  const navigate = useNavigate();
  const { login, authenticated, error: authError } = useAuth();
  
  // Local state for the form
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-navigate when authenticated - but only on component mount to prevent loops
  // We'll use a manual navigate in the login function instead
  useEffect(() => {
    console.log('Auth check on mount, authenticated:', authenticated);
    if (authenticated) {
      navigate('/hair-artist/dashboard');
    }
  }, []);  // Empty dependency array - only run on mount

  // Watch for auth errors from Redux
  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
  }, [authError]);

  // Fill in admin credentials if in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Pre-fill with admin credentials for easier testing
      setFormData({
        email: 'admin@salon.com',
        password: 'admin123'
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Add detailed logging to help diagnose authentication issues
      console.log(`Login attempt for: ${formData.email} with password: ${formData.password.length} chars`);
      console.log('This should match admin@salon.com/admin123');
      
      // Use direct API call with the CORRECT endpoint path
      console.log('Making direct API call to correct endpoint: /api/token');
      const response = await fetch('http://localhost:8000/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: formData.email,
          password: formData.password
        })
      });
      
      let errorDetail = '';
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        errorDetail = errorData.detail || 'Invalid credentials';
        throw new Error(errorDetail);
      }
      
      const data = await response.json();
      console.log('Login successful, received token:', data.access_token?.substring(0, 10) + '...');
      
      // Store token directly
      localStorage.setItem('token', data.access_token);
      
      // Show success notification
      showSuccess('Login successful!');
      
      // Force navigation with window.location for most reliable redirect
      console.log('Login successful, redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/hair-artist/dashboard';
      }, 500);
    } catch (err) {
      // Enhanced error handling with detailed error information
      console.error('Login error details:', err);
      
      // Use our notification util for consistent auth error handling
      showAuthError(err);
      
      // Display a more helpful error message related to the bcrypt issue
      setError(err.message || 'Failed to login. There might be an issue with password verification.');
      
      // Offer some diagnostic info if it might be the bcrypt issue from our memory
      console.log('If login is failing with correct credentials, check if bcrypt dependency is installed');
      console.log('Remember we previously fixed a bcrypt dependency issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Hair Artist Login
          </Typography>
          
          {/* Use our ErrorMessage component for consistent error display */}
          <ErrorMessage error={error} />
          
          {/* Login form with admin hint */}
          <Box mb={2}>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
              Admin credentials: admin@salon.com / admin123
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            margin="normal"
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            margin="normal"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2, py: 1.2 }}
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default HairArtistLogin; 