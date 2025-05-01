import apiClient from '../apiClient';

const serviceApi = {
  getAllServices: async () => {
    const response = await apiClient.get('/services/');
    return response.data;
  },

  createService: async (serviceData) => {
    const response = await apiClient.post('/services/', serviceData);
    return response.data;
  },

  updateService: async (serviceId, serviceData) => {
    const response = await apiClient.put(`/services/${serviceId}`, serviceData);
    return response.data;
  },

  deleteService: async (serviceId) => {
    const response = await apiClient.delete(`/services/${serviceId}`);
    return response.data;
  }
};

export { serviceApi }; 