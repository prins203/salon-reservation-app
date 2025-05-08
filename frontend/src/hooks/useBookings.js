import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings, fetchServices, addDateRange } from '../redux/slices/bookingsSlice';

/**
 * Custom hook to handle booking-related functionality
 */
export const useBookings = () => {
  const dispatch = useDispatch();
  const { bookings, services, cachedDateRanges, loading, error, lastFetchTime } = useSelector(state => state.bookings);
  
  // Check if a date range is already cached
  const isDateRangeCached = useCallback((start, end) => {
    if (cachedDateRanges.length === 0) return false;
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    
    for (const range of cachedDateRanges) {
      const cachedStartTime = new Date(range.start).getTime();
      const cachedEndTime = new Date(range.end).getTime();
      
      if (startTime >= cachedStartTime && endTime <= cachedEndTime) {
        return true;
      }
    }
    
    return false;
  }, [cachedDateRanges]);
  
  // Get uncached date ranges that need to be fetched
  const getUncachedSubRanges = useCallback((start, end) => {
    if (cachedDateRanges.length === 0) {
      return [{ start, end }];
    }
    
    if (isDateRangeCached(start, end)) {
      return [];
    }
    
    // Sort cached ranges by start date
    const sortedRanges = [...cachedDateRanges].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    
    const subRanges = [];
    let currentStart = new Date(start);
    const endDate = new Date(end);
    
    // Check if we need to fetch anything before the first cached range
    if (sortedRanges.length > 0) {
      if (currentStart < new Date(sortedRanges[0].start) && endDate > new Date(sortedRanges[0].start)) {
        subRanges.push({
          start: currentStart.toISOString().split('T')[0],
          end: new Date(Math.min(endDate.getTime(), new Date(sortedRanges[0].start).getTime())).toISOString().split('T')[0]
        });
        currentStart = new Date(sortedRanges[0].end);
      }
      
      // Check for gaps between cached ranges
      for (let i = 0; i < sortedRanges.length - 1; i++) {
        const gapStart = new Date(Math.max(currentStart.getTime(), new Date(sortedRanges[i].end).getTime()));
        const gapEnd = new Date(Math.min(endDate.getTime(), new Date(sortedRanges[i+1].start).getTime()));
        
        if (gapStart < gapEnd) {
          subRanges.push({
            start: gapStart.toISOString().split('T')[0],
            end: gapEnd.toISOString().split('T')[0]
          });
        }
        
        currentStart = new Date(Math.max(currentStart.getTime(), new Date(sortedRanges[i+1].end).getTime()));
      }
      
      // Check if we need to fetch anything after the last cached range
      if (currentStart < endDate) {
        subRanges.push({
          start: currentStart.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        });
      }
    } else {
      subRanges.push({
        start: currentStart.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });
    }
    
    return subRanges;
  }, [cachedDateRanges, isDateRangeCached]);
  
  // Get bookings for a date range - using memoization to prevent dependency loops
  const getBookings = useCallback(async (date, startDate, endDate, forceRefresh = false) => {
    try {
      // Track if we've already started fetching to prevent loops
      const fetchInProgress = window._bookingFetchInProgress;
      if (fetchInProgress) {
        console.log('Preventing duplicate booking fetch');
        return [];
      }
      
      // Set flag to prevent concurrent fetches
      window._bookingFetchInProgress = true;
      
      // If force refresh or date range isn't cached, fetch from API
      if (forceRefresh || !isDateRangeCached(startDate, endDate) || !lastFetchTime) {
        try {
          console.log(`Fetching bookings: ${date}, ${startDate}-${endDate}`);
          const resultAction = await dispatch(fetchBookings({ date, startDate, endDate }));
          
          // Cache the date range
          if (startDate && endDate) {
            dispatch(addDateRange({ start: startDate, end: endDate }));
          }
          
          window._bookingFetchInProgress = false;
          return resultAction.payload;
        } catch (error) {
          window._bookingFetchInProgress = false;
          throw error;
        }
      }
      
      // If we have cache and it's recent (less than 5 minutes old), use it
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      if (lastFetchTime > fiveMinutesAgo) {
        console.log('Using cached bookings data');
        window._bookingFetchInProgress = false;
        return bookings;
      }
      
      // Otherwise fetch fresh data
      try {
        const resultAction = await dispatch(fetchBookings({ date, startDate, endDate }));
        window._bookingFetchInProgress = false;
        return resultAction.payload;
      } catch (error) {
        window._bookingFetchInProgress = false;
        throw error;
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      window._bookingFetchInProgress = false;
      throw error;
    }
  }, [dispatch, bookings, lastFetchTime, isDateRangeCached]);
  
  // Get service details
  const getServices = useCallback(async () => {
    try {
      // If we already have services and they were fetched recently, return them
      if (services.length > 0) {
        return services;
      }
      
      const resultAction = await dispatch(fetchServices());
      return resultAction.payload;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }, [dispatch, services]);
  
  // Get a specific service by name
  const getServiceByName = useCallback((serviceName) => {
    return services.find(service => service.name === serviceName);
  }, [services]);
  
  return {
    bookings,
    services,
    loading,
    error,
    getBookings,
    getServices,
    getServiceByName,
    isDateRangeCached
  };
};

export default useBookings;
