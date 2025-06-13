import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingScreen component displays a centered loading spinner with optional text
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message='Loading...'] - Message to display below the spinner
 * @returns {React.ReactElement} Loading screen component
 */
const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '200px',
        width: '100%',
        p: 3,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;