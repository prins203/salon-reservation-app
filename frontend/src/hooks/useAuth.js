import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, fetchCurrentUser } from '../redux/slices/authSlice';

/**
 * Custom hook to handle authentication-related functionality
 * Replaces the previous AuthContext implementation with Redux
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentUser, loading, authenticated, error } = useSelector(state => state.auth);
  
  // Check for token and fetch user data only on initial load to prevent circular dependencies
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Enhanced debug logging for authentication diagnosis (as per our previous fix)
      console.log('Token found, fetching current user data on initial mount');
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]); // Only depend on dispatch to prevent loops
  
  // Login function
  const login = async (email, password) => {
    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    dispatch(logoutUser());
    navigate('/hair-artist/login');
  };
  
  return {
    currentUser,
    loading,
    authenticated,
    error,
    login,
    logout
  };
};

export default useAuth;
