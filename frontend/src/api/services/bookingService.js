import apiClient from '../apiClient';

export const bookingService = {
  sendOtp: async (bookingData) => {
    const response = await apiClient.post('/booking/send-otp', bookingData);
    return response.data;
  },

  verifyOtp: async (otpData) => {
    const response = await apiClient.post('/booking/verify-otp', otpData);
    return response.data;
  },

  getServices: async () => {
    const response = await apiClient.get('/services/');
    return response.data;
  },

  getAvailableSlots: async (date, hairArtistId) => {
    const response = await apiClient.get('/booking/available-slots', {
      params: { date, hair_artist_id: hairArtistId }
    });
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await apiClient.post('/booking/bookings', {
      name: bookingData.name,
      email: bookingData.contact,
      phone: '', // Optional field
      date: bookingData.date,
      time: bookingData.time,
      service: bookingData.service,
      hair_artist_id: bookingData.hair_artist_id
    });
    return response.data;
  },

  getBookingDetails: async (bookingId) => {
    const response = await apiClient.get(`/booking/bookings/${bookingId}`);
    return response.data;
  }
}; 