import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Reusable loading overlay component
 * Shows a centered loading spinner with optional message
 */
const LoadingOverlay = ({ message = 'Loading...', size = 40, height = '100%' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1000,
        height,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingOverlay;
