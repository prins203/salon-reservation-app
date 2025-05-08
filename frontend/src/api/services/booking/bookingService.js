import apiClient from '../../apiClient';

/**
 * Booking service
 * Handles all booking-related API calls
 */
const bookingService = {
  /**
   * Get bookings for a specific date or date range
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} startDate - Optional start date in YYYY-MM-DD format
   * @param {string} endDate - Optional end date in YYYY-MM-DD format
   * @returns {Promise} - Bookings data
   */
  getBookings: async (date, startDate, endDate) => {
    try {
      // If start and end dates are provided, use date range endpoint
      const params = startDate && endDate
        ? { date, start_date: startDate, end_date: endDate }
        : { date };
      
      const response = await apiClient.get('/booking/bookings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Get available time slots for booking
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {number} hairArtistId - ID of the hair artist
   * @param {number} serviceId - Optional service ID for duration calculation
   * @returns {Promise} - Available time slots
   */
  getAvailableSlots: async (date, hairArtistId, serviceId = null) => {
    try {
      const params = { date, hair_artist_id: hairArtistId };
      if (serviceId) {
        params.service_id = serviceId;
      }
      
      const response = await apiClient.get('/booking/available-slots', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Send OTP for booking confirmation
   * @param {Object} bookingData - Booking request data
   * @returns {Promise} - OTP response
   */
  sendOtp: async (bookingData) => {
    try {
      const response = await apiClient.post('/booking/send-otp', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error sending OTP:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Verify OTP and create booking
   * @param {Object} otpData - OTP verification data
   * @returns {Promise} - Verification response
   */
  verifyOtp: async (otpData) => {
    try {
      const response = await apiClient.post('/booking/verify-otp', otpData);
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise} - New booking data
   */
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post('/booking/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error.message || 'Unknown error');
      throw error;
    }
  }
};

export default bookingService;
