/**
 * Utility functions for appointment handling
 */

/**
 * Calculate end time based on start time and service duration
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {Array} services - Array of services with durations
 * @param {string} serviceName - Name of the service to find duration for
 * @returns {string} - End time in ISO format
 */
export const calculateEndTime = (date, time, services, serviceName) => {
  if (!date || !time || !services || !serviceName) {
    console.warn('Missing parameters in calculateEndTime:', { date, time, serviceName });
    return null;
  }

  try {
    // Enhanced debug logging like we did for authentication issues
    console.log(`Calculating end time for ${serviceName} at ${date} ${time}`);
    
    // Get service duration in minutes
    const serviceDuration = getServiceDuration(services, serviceName);
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
export const getServiceDuration = (services, serviceName) => {
  // If services or serviceName is missing, return default duration
  if (!services || !serviceName) {
    console.warn('Missing parameters in getServiceDuration');
    return 60; // Default to 60 minutes
  }
  
  try {
    // Add debug logging to help diagnose service duration issues
    console.log('Finding duration for service:', serviceName);
    console.log('Available services:', services);
    
    // Find the service in the services array, with case-insensitive matching
    const service = services.find(s => 
      s.name && s.name.toLowerCase() === serviceName.toLowerCase()
    );
    
    // The duration property is just "duration" (not duration_minutes)
    // based on the backend model
    if (service) {
      console.log(`Found service: ${service.name}, duration: ${service.duration} minutes`);
      return service.duration || 60; // Use correct property name
    } else {
      console.warn(`Service '${serviceName}' not found, using default duration`);
      return 60;
    }
  } catch (error) {
    console.error('Error getting service duration:', error);
    return 60; // Default to 60 minutes
  }
};

/**
 * Convert bookings to FullCalendar events format
 * @param {Array} bookings - Array of booking objects
 * @param {Array} services - Array of services with durations
 * @returns {Array} - Events formatted for FullCalendar
 */
export const bookingsToEvents = (bookings, services) => {
  if (!bookings || !Array.isArray(bookings)) {
    console.warn('No bookings data or invalid format');
    return [];
  }
  
  if (!services || !Array.isArray(services)) {
    console.warn('No services data or invalid format');
    return [];
  }
  
  console.log(`Converting ${bookings.length} bookings to calendar events`);
  
  const events = bookings.map(booking => {
    // Make sure we have valid booking data
    if (!booking.date || !booking.time || !booking.service) {
      console.warn('Booking missing required data:', booking);
      return null;
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
      return null;
    }
    
    // Calculate start and end dates
    const startDate = `${booking.date}T${timeString}`;
    
    // Add debug logs similar to our authentication debugging approach
    console.log(`Creating event for ${booking.service} at ${startDate}`);
    
    let endDate = calculateEndTime(
      booking.date, 
      timeString, 
      services, 
      booking.service
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
    
    return {
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
        duration: getServiceDuration(services, booking.service)
      }
    };
  }).filter(Boolean); // Remove any null events
  
  console.log(`Successfully created ${events.length} calendar events`);
  return events;
};
