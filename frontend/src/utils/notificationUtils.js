import { toast } from 'react-toastify';

/**
 * Notification utilities for consistent user feedback
 * Uses react-toastify for notifications
 */

// Default toast options
const defaultOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Show success notification
 * @param {string} message - Notification message
 * @param {object} options - Toast options (optional)
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Show error notification
 * @param {string|Error} error - Error message or object
 * @param {object} options - Toast options (optional) 
 */
export const showError = (error, options = {}) => {
  // Handle different error formats
  let errorMessage = 'An unknown error occurred';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
    // If it's a server error, try to extract more details
    if (error.data?.detail) {
      errorMessage += `: ${error.data.detail}`;
    }
  }
  
  // Log for debugging, especially authentication issues
  console.error('Error notification:', errorMessage, error);
  
  toast.error(errorMessage, { ...defaultOptions, ...options });
};

/**
 * Show info notification
 * @param {string} message - Notification message
 * @param {object} options - Toast options (optional)
 */
export const showInfo = (message, options = {}) => {
  toast.info(message, { ...defaultOptions, ...options });
};

/**
 * Show warning notification
 * @param {string} message - Warning message
 * @param {object} options - Toast options (optional)
 */
export const showWarning = (message, options = {}) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

/**
 * Show loading notification
 * @param {string} message - Loading message
 * @returns {string} - Toast ID for updating later
 */
export const showLoading = (message = 'Loading...') => {
  return toast.loading(message, { ...defaultOptions });
};

/**
 * Update existing toast
 * @param {string} toastId - Toast ID to update
 * @param {string} message - New message
 * @param {string} type - Toast type (success, error, etc.)
 */
export const updateToast = (toastId, message, type = 'success') => {
  toast.update(toastId, {
    render: message,
    type,
    isLoading: false,
    ...defaultOptions
  });
};

/**
 * Dismiss a specific toast
 * @param {string} toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Show authentication error with special handling
 * Used for login issues and token problems
 * @param {Error} error - Authentication error
 */
export const showAuthError = (error) => {
  // Extract meaningful messages for authentication errors
  let errorMessage = 'Authentication failed';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.response?.status === 401) {
    errorMessage = 'Invalid credentials. Please check your email and password.';
    // Log detailed authentication error for debugging (fixed issue #4)
    console.error('Authentication error details:', error.response?.data);
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  toast.error(errorMessage, {
    ...defaultOptions,
    autoClose: 7000, // Show longer for auth errors
    toastId: 'auth-error' // Prevent duplicate auth error messages
  });
};

/**
 * Handle OTP verification errors with better feedback
 * @param {Error} error - OTP verification error
 */
export const showOtpError = (error) => {
  // Handle OTP verification errors with specific fallbacks (fixed issue #2)
  let errorMessage = 'OTP verification failed';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.response?.data?.detail) {
    errorMessage = error.response.data.detail;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  // Log for debugging
  console.error('OTP verification error:', errorMessage, error);
  
  toast.error(errorMessage, {
    ...defaultOptions,
    autoClose: 10000, // Show longer for OTP errors
  });
};
