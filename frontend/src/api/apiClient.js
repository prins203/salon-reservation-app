import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Enhanced API client with improved error handling, retries, and logging
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request logging and auth token handling
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to track request duration
    config.metadata = { startTime: new Date() };
    
    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, 
        config.params || config.data || '');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response handling with retry logic and error processing
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = response.config.metadata ? 
      new Date() - response.config.metadata.startTime : 
      'unknown';
    
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url} (${duration}ms)`,
        response.status);
    }
    
    return response;
  },
  async (error) => {
    // Get original request config
    const originalRequest = error.config;
    
    // Calculate request duration
    const duration = originalRequest.metadata ? 
      new Date() - originalRequest.metadata.startTime : 
      'unknown';
    
    // Log the error
    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms)`,
      error.response?.status, error.response?.data || error.message);
    
    // Implement retry logic for network errors or 5xx server errors
    const shouldRetry = 
      (!error.response || error.response.status >= 500) && 
      originalRequest && 
      (!originalRequest.retryCount || originalRequest.retryCount < MAX_RETRIES);
    
    if (shouldRetry) {
      originalRequest.retryCount = originalRequest.retryCount ? 
        originalRequest.retryCount + 1 : 1;
      
      console.log(`🔄 Retrying request (${originalRequest.retryCount}/${MAX_RETRIES}): ${originalRequest.url}`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * originalRequest.retryCount));
      return apiClient(originalRequest);
    }
    
    // Authentication error handling
    if (error.response?.status === 401) {
      // Only redirect to login for authenticated routes
      if (originalRequest?.url?.includes('/hair-artists/') || 
          originalRequest?.url?.includes('/booking/bookings')) {
        console.log('🔒 Authentication failed, redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/hair-artist/login';
      }
    }
    
    // Create a standardized error object
    const enhancedError = {
      status: error.response?.status || 0,
      message: error.response?.data?.detail || error.message || 'Unknown error',
      data: error.response?.data || {},
      originalError: error
    };
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient; 