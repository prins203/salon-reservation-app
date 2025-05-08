/**
 * Token utilities for authentication
 * Handles token storage, decoding, and refresh mechanism
 */

/**
 * Parse JWT token without external libraries
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const parseJwt = (token) => {
  try {
    // Split the token and get the payload part (second part)
    const base64Url = token.split('.')[1];
    // Replace URL-safe characters and create proper base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Decode and parse the payload
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = parseJwt(token);
    if (!decoded) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token expiration time in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - Expiration time in milliseconds
 */
export const getTokenExpirationTime = (token) => {
  if (!token) return 0;
  
  try {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return 0;
    
    // Convert seconds to milliseconds
    return decoded.exp * 1000;
  } catch (error) {
    console.error('Error getting token expiration time:', error);
    return 0;
  }
};

/**
 * Calculate time until token expires
 * @param {string} token - JWT token
 * @returns {number} - Time until expiration in milliseconds
 */
export const getTimeUntilExpiration = (token) => {
  if (!token) return 0;
  
  const expirationTime = getTokenExpirationTime(token);
  return Math.max(0, expirationTime - Date.now());
};

/**
 * Get user information from token
 * @param {string} token - JWT token
 * @returns {Object} - User information from token
 */
export const getUserFromToken = (token) => {
  if (!token) return null;
  
  try {
    const decoded = parseJwt(token);
    if (!decoded) return null;
    
    return {
      email: decoded.sub,
      isAdmin: decoded.is_admin || false,
      exp: decoded.exp
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

/**
 * Token storage management with enhanced security
 */
export const tokenStorage = {
  getToken: () => localStorage.getItem('token'),
  
  setToken: (token) => {
    localStorage.setItem('token', token);
    
    // Set token expiration reminder
    const timeUntilExp = getTimeUntilExpiration(token);
    if (timeUntilExp > 0) {
      // Set timeout to warn about expiration 5 minutes before it happens
      const warningTime = timeUntilExp - (5 * 60 * 1000); 
      if (warningTime > 0) {
        setTimeout(() => {
          console.warn('Token will expire in 5 minutes');
          // Dispatch event for components to handle
          window.dispatchEvent(new CustomEvent('token-expiring'));
        }, warningTime);
      }
    }
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: () => {
    const token = tokenStorage.getToken();
    return !!token && !isTokenExpired(token);
  }
};
