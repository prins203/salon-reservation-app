import apiClient from '../../apiClient';

/**
 * Authentication service
 * Handles login, token management and user authentication
 */
const authService = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Response with token
   */
  login: async (email, password) => {
    try {
      // Create form data for authentication
      const formData = new URLSearchParams();
      formData.append('username', email); // Backend expects 'username' for email
      formData.append('password', password);

      // Log authentication attempt for debugging
      console.log(`Login attempt for: ${email}`);
      
      const response = await apiClient.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Save token to localStorage
      if (response.data?.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Logout user by removing token
   */
  logout: () => {
    localStorage.removeItem('token');
  },

  /**
   * Get current user profile
   * @returns {Promise} - User data
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/hair-artists/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Get JWT token
   * @returns {string|null} - JWT token or null if not authenticated
   */
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
