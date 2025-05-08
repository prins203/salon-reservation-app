import apiClient from '../../apiClient';

/**
 * Hair Artist Service
 * Handles all hair artist-related API calls
 */
const hairArtistService = {
  /**
   * Get all hair artists (admin only)
   * @returns {Promise} - List of hair artists
   */
  getHairArtists: async () => {
    try {
      const response = await apiClient.get('/hair-artists/');
      return response.data;
    } catch (error) {
      console.error('Error fetching hair artists:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Get public list of hair artists (for booking)
   * @returns {Promise} - List of hair artists
   */
  getHairArtistsPublic: async () => {
    try {
      const response = await apiClient.get('/hair-artists/public');
      return response.data;
    } catch (error) {
      console.error('Error fetching public hair artists:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Create a new hair artist (admin only)
   * @param {Object} artistData - Hair artist data
   * @returns {Promise} - New hair artist data
   */
  createHairArtist: async (artistData) => {
    try {
      const response = await apiClient.post('/hair-artists/', artistData);
      return response.data;
    } catch (error) {
      console.error('Error creating hair artist:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Delete a hair artist (admin only)
   * @param {number} artistId - Hair artist ID
   * @returns {Promise} - Response data
   */
  deleteHairArtist: async (artistId) => {
    try {
      const response = await apiClient.delete(`/hair-artists/${artistId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hair artist:', error.message || 'Unknown error');
      throw error;
    }
  },
  
  /**
   * Update a hair artist (admin only)
   * @param {number} artistId - Hair artist ID
   * @param {Object} artistData - Updated hair artist data
   * @returns {Promise} - Updated hair artist data
   */
  updateHairArtist: async (artistId, artistData) => {
    try {
      const response = await apiClient.put(`/hair-artists/${artistId}`, artistData);
      return response.data;
    } catch (error) {
      console.error('Error updating hair artist:', error.message || 'Unknown error');
      throw error;
    }
  },
  
  /**
   * Get bookings for a hair artist
   * @param {string} date - The date to fetch bookings for (YYYY-MM-DD)
   * @param {string} startDate - Start date range (YYYY-MM-DD)
   * @param {string} endDate - End date range (YYYY-MM-DD)
   * @returns {Promise} - List of bookings
   */
  getBookings: async (date, startDate, endDate) => {
    try {
      // Construct query parameters
      let url = '/booking/bookings';
      const params = {};
      
      if (date) params.date = date;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error.message || 'Unknown error');
      throw error;
    }
  }
};

export default hairArtistService;
