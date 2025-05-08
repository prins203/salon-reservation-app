import serviceServiceImpl from './services/serviceService';
import apiClient from '../apiClient';

// This file provides backward compatibility with our new modular implementation
const serviceApi = {
  getAllServices: async () => {
    try {
      return await serviceServiceImpl.getServices();
    } catch (error) {
      console.error('Error fetching all services:', error);
      throw error;
    }
  },

  createService: async (serviceData) => {
    try {
      // For now, use original implementation as this isn't in our modular service yet
      const response = await apiClient.post('/services/', serviceData);
      return response.data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  updateService: async (serviceId, serviceData) => {
    try {
      // For now, use original implementation as this isn't in our modular service yet
      const response = await apiClient.put(`/services/${serviceId}`, serviceData);
      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  deleteService: async (serviceId) => {
    try {
      // For now, use original implementation as this isn't in our modular service yet
      const response = await apiClient.delete(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
};

export { serviceApi }; 