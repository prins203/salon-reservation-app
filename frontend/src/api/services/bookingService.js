import bookingServiceImpl from './booking/bookingService';
import serviceServiceImpl from './services/serviceService';
import apiClient from '../apiClient';

// This file provides backward compatibility for existing code
// It uses our new modular implementation under the hood
export const bookingService = {
  // Use our new service implementation with proper error handling
  sendOtp: async (bookingData) => {
    try {
      return await bookingServiceImpl.sendOtp(bookingData);
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  verifyOtp: async (otpData) => {
    try {
      // Enhanced error handling for OTP verification
      console.log('Verifying OTP with data:', { ...otpData, code: '***' });
      return await bookingServiceImpl.verifyOtp(otpData);
    } catch (error) {
      // Add better error logging for OTP issues
      console.error('OTP verification error:', error);
      throw error;
    }
  },

  getServices: async () => {
    try {
      return await serviceServiceImpl.getServices();
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  getAvailableSlots: async (date, hairArtistId, serviceId = null) => {
    try {
      return await bookingServiceImpl.getAvailableSlots(date, hairArtistId, serviceId);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      // Format booking data for the API
      const formattedData = {
        name: bookingData.name,
        email: bookingData.contact,
        phone: bookingData.phone || '', // Provide fallback for optional field
        date: bookingData.date,
        time: bookingData.time,
        service: bookingData.service,
        hair_artist_id: bookingData.hair_artist_id
      };
      
      return await bookingServiceImpl.createBooking(formattedData);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  getBookingDetails: async (bookingId) => {
    try {
      // Maintain original implementation for now (not yet in the modular service)
      const response = await apiClient.get(`/booking/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  },

  getBookings: async (date, startDate, endDate) => {
    try {
      // Add detailed logging to help diagnose booking fetch issues
      console.log(`Fetching bookings with params: date=${date}, startDate=${startDate}, endDate=${endDate}`);
      
      const params = { date };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      // Use the correct path with /api prefix (similar fix to what we did for authentication)
      const response = await apiClient.get('/booking/bookings', { params });
      
      console.log(`Booking response received with ${response.data.length} bookings`);
      
      return response.data;
    } catch (error) {
      // Detailed error handling for booking fetch issues
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }
}; 