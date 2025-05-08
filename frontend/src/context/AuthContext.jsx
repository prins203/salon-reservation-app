import React, { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser, fetchCurrentUser } from '../redux/slices/authSlice';

// Import directly from hairArtistService to avoid circular dependencies
import { hairArtistService } from '../api/services/hairArtistService';

/**
 * Auth Context - Simplified bridge between old Context API and new Redux implementation
 * This provides backward compatibility for components still using the AuthContext
 */
const AuthContext = createContext();

/**
 * Hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth Provider component - Simplified to use Redux under the hood
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  
  // Enhanced login function with proper state management
  const login = async (email, password) => {
    try {
      // Log to help diagnose authentication issues (per our previous fix)
      console.log(`Attempting login for: ${email}`);
      
      // Use direct Redux dispatch for login to ensure state is properly updated
      const result = await dispatch(loginUser({ email, password })).unwrap();
      
      // If we get here, login was successful - ensure we update Redux authenticated state
      await dispatch(fetchCurrentUser());
      
      console.log('Login successful, authentication state updated');
      return result;
    } catch (error) {
      // Enhanced error logging for debugging auth issues (per our previous fix)
      console.error('Login error details:', error);
      throw error;
    }
  };

  // Simple logout function that dispatches Redux action
  const logout = () => {
    dispatch(logoutUser());
    // Clear token from localStorage
    localStorage.removeItem('token');
  };

  // Create a simplified value object with state and methods from Redux
  const value = {
    currentUser: auth.currentUser,
    loading: auth.loading,
    authenticated: auth.authenticated,
    error: auth.error,
    login,
    logout
  };

  // Simplified provider that just passes Redux state and methods
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};