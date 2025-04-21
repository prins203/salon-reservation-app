import apiClient from '../apiClient';

export const hairArtistService = {
  login: async (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await apiClient.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getBookings: async (date) => {
    const response = await apiClient.get('/booking/bookings', {
      params: { date }
    });
    return response.data;
  },

  getHairArtists: async () => {
    const response = await apiClient.get('/hair-artists/');
    return response.data;
  },

  getHairArtistsPublic: async () => {
    const response = await apiClient.get('/hair-artists/public');
    return response.data;
  },

  createHairArtist: async (artistData) => {
    const response = await apiClient.post('/hair-artists/', artistData);
    return response.data;
  },

  deleteHairArtist: async (artistId) => {
    const response = await apiClient.delete(`/hair-artists/${artistId}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/hair-artists/me');
    return response.data;
  }
}; 