import serviceService from '../api/services/services/serviceService';

/**
 * Utility functions for appointment handling
 * 
 * Enhanced with features to ensure accurate duration calculations
 * even when service durations are updated
 */

/**
 * Calculate end time based on start time and service duration
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {Array} services - Array of services with durations
 * @param {string} serviceName - Name of the service to find duration for
 * @param {boolean} forceRefresh - Whether to force refresh service duration from backend
 * @returns {Promise<string>} - End time in ISO format
 */
export const calculateEndTime = async (date, time, services, serviceName, forceRefresh = false) => {
  if (!date || !time || !services || !serviceName) {
    console.warn('Missing parameters in calculateEndTime:', { date, time, serviceName });
    return null;
  }

  try {
    // Enhanced debug logging like we did for authentication issues
    console.log(`Calculating end time for ${serviceName} at ${date} ${time}`);
    
    // Get service duration in minutes - now asynchronous with refresh option
    const serviceDuration = await getServiceDuration(services, serviceName, forceRefresh);
    console.log(`Service duration for ${serviceName}: ${serviceDuration} minutes`);
    
    // Convert date and time to a Date object
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.error(`Invalid time format: ${time}`);
      return null;
    }
    
    // Create date object and handle timezone issues
    const startDate = new Date(`${date}T${time}:00`);
    console.log(`Start datetime: ${startDate.toISOString()}`);
    
    // Add service duration to get end time
    const endDate = new Date(startDate.getTime() + serviceDuration * 60 * 1000);
    console.log(`End datetime: ${endDate.toISOString()}`);
    
    return endDate.toISOString();
  } catch (error) {
    // Enhanced error handling similar to our authentication fixes
    console.error('Error calculating end time:', error);
    console.error('Parameters:', { date, time, serviceName });
    return null;
  }
};

/**
 * Get service duration from the service name
 * @param {Array} services - Array of services
 * @param {string} serviceName - Name of the service
 * @returns {number} - Duration in minutes, defaults to 60 if not found
 */
// Service duration cache to keep track of manual requests for latest durations
const serviceDurationCache = { 
  durations: {},
  timestamp: {}
};

/**
 * Get service duration from the service name, with an option to force refresh
 * from the backend to ensure we always have the latest data
 * @param {Array} services - Array of services
 * @param {string} serviceName - Name of the service
 * @param {boolean} forceRefresh - Whether to force a refresh from backend
 * @returns {Promise<number>} - Duration in minutes, defaults to 60 if not found
 */
export const getServiceDuration = async (services, serviceName, forceRefresh = false) => {
  // If services or serviceName is missing, return default duration
  if (!services || !serviceName) {
    console.warn('Missing parameters in getServiceDuration');
    return 60; // Default to 60 minutes
  }
  
  try {
    // First check if we have a recently cached duration for this service
    const cacheKey = serviceName.toLowerCase();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes cache expiry
    const now = Date.now();
    const hasRecentCache = serviceDurationCache.timestamp[cacheKey] && 
                         (now - serviceDurationCache.timestamp[cacheKey] < cacheExpiry);

    // Use cache if it's fresh and we're not forcing a refresh
    if (!forceRefresh && hasRecentCache) {
      console.log(`Using cached duration for ${serviceName}: ${serviceDurationCache.durations[cacheKey]} minutes`);
      return serviceDurationCache.durations[cacheKey];
    }
    
    // Add debug logging to help diagnose service duration issues
    console.log('Finding duration for service:', serviceName);
    
    // Try to get the latest service information directly from the backend
    try {
      // Use our enhanced serviceService to get the freshest data
      const freshService = await serviceService.getServiceByName(serviceName, true);
      if (freshService) {
        // Update our cache
        serviceDurationCache.durations[cacheKey] = freshService.duration;
        serviceDurationCache.timestamp[cacheKey] = now;
        
        console.log(`Got fresh service duration from backend: ${freshService.name}, ${freshService.duration} minutes`);
        return freshService.duration;
      }
    } catch (apiError) {
      // If the API call fails, use the local services array as fallback
      console.warn(`Failed to get fresh service data: ${apiError.message}. Falling back to local data.`);
    }
    
    // Fallback to local services array if API call failed
    const service = services.find(s => 
      s.name && s.name.toLowerCase() === serviceName.toLowerCase()
    );
    
    if (service) {
      // Save to cache
      serviceDurationCache.durations[cacheKey] = service.duration || 60;
      serviceDurationCache.timestamp[cacheKey] = now;
      
      console.log(`Found service in local data: ${service.name}, duration: ${service.duration} minutes`);
      return service.duration || 60;
    } 
    
    // If we get here, we couldn't find the service anywhere
    console.warn(`Service '${serviceName}' not found anywhere, using default duration`);
    return 60;
  } catch (error) {
    // Enhanced error logging similar to our authentication fix approach
    console.error('Error getting service duration:', error);
    console.error('Service lookup parameters:', { serviceName, serviceCount: services?.length });
    return 60; // Default to 60 minutes
  }
};

/**
 * Convert bookings to FullCalendar events format with accurate, up-to-date durations
 * @param {Array} bookings - Array of booking objects
 * @param {Array} services - Array of services with durations
 * @param {boolean} forceRefresh - Whether to force-refresh service duration data
 * @returns {Promise<Array>} - Events formatted for FullCalendar
 */
export const bookingsToEvents = async (bookings, services, forceRefresh = false) => {
  if (!bookings || !Array.isArray(bookings)) {
    console.warn('No bookings data or invalid format');
    return [];
  }
  
  if (!services || !Array.isArray(services)) {
    console.warn('No services data or invalid format');
    return [];
  }
  
  console.log(`Converting ${bookings.length} bookings to calendar events`);
  
  // Process bookings sequentially to prevent rate limiting issues
  const events = [];
  
  for (const booking of bookings) {
    // Make sure we have valid booking data
    if (!booking.date || !booking.time || !booking.service) {
      console.warn('Booking missing required data:', booking);
      continue;
    }
    
    // Format time if needed (backend might return different formats)
    let timeString = booking.time;
    if (timeString.includes('.')) {
      // Handle potential seconds in time format
      timeString = timeString.split('.')[0];
    }
    
    // Ensure time is in HH:MM format
    if (!timeString.includes(':')) {
      console.warn(`Invalid time format: ${timeString}`);
      continue;
    }
    
    // Calculate start and end dates
    const startDate = `${booking.date}T${timeString}`;
    
    // Add debug logs similar to our authentication debugging approach
    console.log(`Creating event for ${booking.service} at ${startDate}`);
    
    try {
      // Get the end time with the most up-to-date service duration
      // Using the async calculateEndTime
      let endDate = await calculateEndTime(
        booking.date, 
        timeString, 
        services, 
        booking.service,
        forceRefresh
      );
      
      // If end date calculation failed, default to 1 hour duration
      if (!endDate) {
        console.warn(`End time calculation failed for booking ID ${booking.id}, using 60 minute default`);
        const start = new Date(`${booking.date}T${timeString}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        endDate = end.toISOString();
      }
      
      // Map status to color
      let color;
      switch ((booking.status || '').toLowerCase()) {
        case 'confirmed':
          color = '#4caf50'; // Green
          break;
        case 'pending':
          color = '#ff9800'; // Orange
          break;
        case 'cancelled':
          color = '#f44336'; // Red
          break;
        default:
          color = '#2196f3'; // Blue
      }
      
      // Get the current duration for this service - using the async function
      const duration = await getServiceDuration(services, booking.service, forceRefresh);
      
      // Create event object
      const event = {
        id: booking.id.toString(),
        title: booking.service,
        start: startDate,
        end: endDate,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          service: booking.service,
          status: booking.status,
          duration: duration
        }
      };
      
      events.push(event);
    } catch (error) {
      // Enhanced error logging following our authentication fix approach
      console.error(`Error processing booking ${booking.id}:`, error);
      console.error('Booking data:', booking);
    }
  }
  
  console.log(`Successfully created ${events.length} calendar events`);
  return events;
};
