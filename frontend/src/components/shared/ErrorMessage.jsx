import React from 'react';
import { Alert, Box, Typography } from '@mui/material';

/**
 * Reusable error message component
 * Displays error messages with consistent styling
 */
const ErrorMessage = ({ 
  error, 
  title = 'Error', 
  showDetails = false,
  onRetry = null,
  sx = {}
}) => {
  // If no error, don't render anything
  if (!error) return null;
  
  // Handle different error formats
  let errorMessage = '';
  let errorDetails = '';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
    errorDetails = error.data?.detail || JSON.stringify(error.data || {});
  } else {
    errorMessage = 'An unknown error occurred';
    try {
      errorDetails = JSON.stringify(error);
    } catch (e) {
      errorDetails = 'Error details not available';
    }
  }

  return (
    <Box sx={{ my: 2, ...sx }}>
      <Alert 
        severity="error"
        variant="filled"
        action={
          onRetry ? (
            <Typography
              component="span"
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 'bold',
                color: 'white'
              }}
              onClick={onRetry}
            >
              Retry
            </Typography>
          ) : undefined
        }
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="body2">
          {errorMessage}
        </Typography>
        
        {showDetails && errorDetails && (
          <Typography 
            variant="caption" 
            component="pre" 
            sx={{ 
              mt: 1, 
              p: 1, 
              backgroundColor: 'rgba(0,0,0,0.1)', 
              borderRadius: 1,
              maxHeight: '100px',
              overflow: 'auto' 
            }}
          >
            {errorDetails}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
