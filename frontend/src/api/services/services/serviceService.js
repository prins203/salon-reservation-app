import apiClient from '../../apiClient';

/**
 * Service management
 * Handles all salon service-related API calls
 */
const serviceService = {
  /**
   * Get all available services
   * @returns {Promise} - List of services
   */
  getServices: async () => {
    try {
      const response = await apiClient.get('/booking/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Get service by ID
   * @param {number} serviceId - Service ID
   * @returns {Promise} - Service details
   */
  getServiceById: async (serviceId) => {
    try {
      const services = await serviceService.getServices();
      return services.find(service => service.id === serviceId);
    } catch (error) {
      console.error('Error fetching service by ID:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Get service by name
   * @param {string} serviceName - Service name
   * @returns {Promise} - Service details
   */
  getServiceByName: async (serviceName) => {
    try {
      const services = await serviceService.getServices();
      return services.find(service => service.name === serviceName);
    } catch (error) {
      console.error('Error fetching service by name:', error.message || 'Unknown error');
      throw error;
    }
  }
};

export default serviceService;
