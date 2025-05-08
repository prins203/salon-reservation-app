import apiClient from '../apiClient';
import hairArtistServiceImpl from './hairArtist/hairArtistService';
import authServiceImpl from './auth/authService';
import serviceServiceImpl from './services/serviceService';

// This file provides backward compatibility for existing code
// Importantly, it resolves parameter mismatch in authentication flow that was causing issues
export const hairArtistService = {
  // Fixed login method to resolve parameter mismatch with AuthContext
  login: async (email, password) => {
    try {
      // Add debug logging to help diagnose authentication issues
      console.log(`Login attempt for: ${email}`); // Added debugging as per memory
      
      // Use our new auth service implementation
      const response = await authServiceImpl.login(email, password);
      
      // Ensure we return the expected response format
      return response;
    } catch (error) {
      // Enhanced error handling with better logging
      console.error('Authentication error details:', error); // Added debugging as per memory
      throw error;
    }
  },

  getBookings: async (date, startDate, endDate) => {
    try {
      // Enhanced debug logging (matching our authentication fix approach)
      console.log(`Fetching bookings for date=${date}, startDate=${startDate}, endDate=${endDate}`);
      
      // Use apiClient directly with the correct API path format
      const params = { date };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      // Use the correct path WITHOUT the /api prefix (it's already in apiClient baseURL)
      const response = await apiClient.get('/booking/bookings', { params });
      
      // Log the response for debugging
      console.log(`Successfully fetched ${response.data.length} bookings`);
      
      return response.data;
    } catch (error) {
      // Enhanced error logging as per our previous authentication fix
      console.error('Error fetching bookings details:', error);
      throw error;
    }
  },

  getHairArtists: async () => {
    try {
      return await hairArtistServiceImpl.getHairArtists();
    } catch (error) {
      console.error('Error fetching hair artists:', error);
      throw error;
    }
  },

  getHairArtistsPublic: async () => {
    try {
      return await hairArtistServiceImpl.getHairArtistsPublic();
    } catch (error) {
      console.error('Error fetching public hair artists:', error);
      throw error;
    }
  },

  createHairArtist: async (artistData) => {
    try {
      return await hairArtistServiceImpl.createHairArtist(artistData);
    } catch (error) {
      console.error('Error creating hair artist:', error);
      throw error;
    }
  },

  deleteHairArtist: async (artistId) => {
    try {
      return await hairArtistServiceImpl.deleteHairArtist(artistId);
    } catch (error) {
      console.error('Error deleting hair artist:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      // Use our auth service for consistent authentication handling
      return await authServiceImpl.getCurrentUser();
    } catch (error) {
      // Enhanced logging for authentication debugging per memory
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  getServices: async () => {
    try {
      // Use our services service
      return await serviceServiceImpl.getServices();
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
}; 