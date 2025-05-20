import apiClient from '../../apiClient';

/**
 * Service Service
 * Handles service-related API calls
 */
const serviceService = {
  /**
   * Get all services
   * @returns {Promise<Array>} - List of services
   */
  getServices: async () => {
    try {
      const response = await apiClient.get('/services');
      // Add a timestamp to track when services were last fetched
      const servicesWithTimestamp = response.data.map(service => ({
        ...service,
        _lastFetched: new Date().toISOString()
      }));
      return servicesWithTimestamp;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific service by ID (ensures latest data)
   * @param {number} serviceId - Service ID
   * @returns {Promise<Object>} - Service data
   */
  getServiceById: async (serviceId) => {
    try {
      // Use the dedicated endpoint to get the most up-to-date service info
      const response = await apiClient.get(`/services/${serviceId}`);
      const serviceData = {
        ...response.data,
        _lastFetched: new Date().toISOString()
      };
      return serviceData;
    } catch (error) {
      console.error('Error fetching service by ID:', error.message || 'Unknown error');
      throw error;
    }
  },

  /**
   * Get service by name with force refresh option
   * @param {string} serviceName - Service name
   * @param {boolean} forceRefresh - Force refresh from server
   * @returns {Promise} - Service details
   */
  getServiceByName: async (serviceName, forceRefresh = false) => {
    try {
      // Get all services
      const services = await serviceService.getServices();
      
      // Find the service by name (case-insensitive)
      const service = services.find(service => 
        service.name.toLowerCase() === serviceName.toLowerCase()
      );
      
      if (!service) {
        console.warn(`Service '${serviceName}' not found`);
        return null;
      }
      
      // If we want the latest data or data is older than 5 minutes, refresh
      const needsRefresh = forceRefresh || 
        !service._lastFetched ||
        (new Date() - new Date(service._lastFetched) > 5 * 60 * 1000);
      
      if (needsRefresh) {
        return await serviceService.getServiceById(service.id);
      }
      
      return service;
    } catch (error) {
      console.error('Error fetching service by name:', error.message || 'Unknown error');
      throw error;
    }
  }
};

export default serviceService;
