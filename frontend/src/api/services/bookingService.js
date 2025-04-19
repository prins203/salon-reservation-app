import apiClient from '../apiClient';

export const bookingService = {
  sendOtp: async (bookingData) => {
    const response = await apiClient.post('/api/booking/send-otp', bookingData);
    return response.data;
  },

  verifyOtp: async (otpData) => {
    const response = await apiClient.post('/api/booking/verify-otp', otpData);
    return response.data;
  },

  getServices: async () => {
    const response = await apiClient.get('/api/booking/services');
    return response.data;
  },

  getAvailableSlots: async (date, hairArtistId) => {
    const response = await apiClient.get('/api/booking/available-slots', {
      params: { date, hair_artist_id: hairArtistId }
    });
    return response.data;
  }
}; 