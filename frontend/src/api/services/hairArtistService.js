import apiClient from '../apiClient';

export const hairArtistService = {
  login: async (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await apiClient.post('/api/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getBookings: async (date) => {
    const response = await apiClient.get('/api/booking/bookings', {
      params: { date }
    });
    return response.data;
  },

  getHairArtists: async () => {
    const response = await apiClient.get('/api/hair-artists/');
    return response.data;
  },

  getHairArtistsPublic: async () => {
    const response = await apiClient.get('/api/hair-artists/public');
    return response.data;
  },

  createHairArtist: async (artistData) => {
    const response = await apiClient.post('/api/hair-artists/', artistData);
    return response.data;
  },

  deleteHairArtist: async (artistId) => {
    const response = await apiClient.delete(`/api/hair-artists/${artistId}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/hair-artists/me');
    return response.data;
  }
}; 