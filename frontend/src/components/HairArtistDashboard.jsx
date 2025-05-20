import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box
} from '@mui/material';

// Redux and Custom Hooks
import useAuth from '../hooks/useAuth';
import useBookings from '../hooks/useBookings';

// Components
import CalendarView from './dashboard/CalendarView';
import AppointmentDetailsDialog from './dashboard/AppointmentDetailsDialog';
import DashboardHeader from './dashboard/DashboardHeader';

// Utils
import { bookingsToEvents } from '../utils/appointmentUtils';
import { format } from 'date-fns';

function HairArtistDashboard() {
  const navigate = useNavigate();
  
  // Use custom hooks
  const { currentUser, logout } = useAuth();
  const { bookings, services, loading, getBookings, getServices } = useBookings();
  
  // Local state for UI
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  // Handlers
  const handleLogout = () => {
    logout();
    navigate('/hair-artist/login');
  };

  const handleViewChange = (event, newView) => {
    if (newView) {
      setCalendarView(newView);
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowEventDialog(true);
  };

  const handleCloseDialog = () => {
    setShowEventDialog(false);
    setSelectedEvent(null);
  };

  // Store the last fetched date range to prevent redundant fetches
  const lastFetchedRange = React.useRef({ startDate: null, endDate: null });
  
  const handleDatesSet = async (dateInfo) => {
    try {
      // Format dates
      const startDate = format(dateInfo.start, 'yyyy-MM-dd');
      const endDate = format(dateInfo.end, 'yyyy-MM-dd');
      const visibleDate = format(dateInfo.start, 'yyyy-MM-dd');
      
      // Check if we've already fetched this range to prevent loops
      if (lastFetchedRange.current.startDate === startDate && 
          lastFetchedRange.current.endDate === endDate) {
        console.log('Skipping redundant bookings fetch for same date range');
        return;
      }
      
      // Update the last fetched range
      lastFetchedRange.current = { startDate, endDate };
      console.log(`Fetching bookings for range: ${startDate} to ${endDate}`);
      
      // Fetch bookings for the displayed date range
      await getBookings(visibleDate, startDate, endDate);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Use console error instead of state since we removed the error state
    }
  };

  const handleRefresh = async () => {
    try {
      // Get current date in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Calculate a date range for the current view (today +/- 14 days)
      const twoWeeksAgo = format(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      const twoWeeksLater = format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      // Force refresh by bypassing cache
      await getBookings(today, twoWeeksAgo, twoWeeksLater, true);
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Use toast notification instead of state error
      // We'll add toast notifications in a future update
    }
  };

  // Track if initial data has been loaded to prevent infinite loops
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Load services and initial bookings only once on component mount
  useEffect(() => {
    // Guard against multiple loads
    if (initialDataLoaded) return;
    
    const loadInitialData = async () => {
      try {
        console.log('Loading initial dashboard data...');
        
        // Get services for duration calculations
        await getServices();
        
        // Get current date in YYYY-MM-DD format
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Calculate a date range for the initial view (today +/- 14 days)
        const twoWeeksAgo = format(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const twoWeeksLater = format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        
        // Fetch bookings for the initial date range
        await getBookings(today, twoWeeksAgo, twoWeeksLater);
        
        // Mark as loaded to prevent future calls
        setInitialDataLoaded(true);
        console.log('Initial dashboard data loaded successfully');
      } catch (error) {
        console.error('Error loading initial data:', error);
        console.warn('Failed to load initial data. Please refresh the page.');
      }
    };
    
    loadInitialData();
    
    // Empty dependency array - only run once on mount
  }, []);
  
  // Convert bookings to calendar events whenever bookings or services change
  useEffect(() => {
    // Define an async function inside the effect to handle the async bookingsToEvents
    const processBookings = async () => {
      console.log('Bookings data received:', bookings);
      console.log('Services data:', services);
      
      // Check if bookings is an array
      if (Array.isArray(bookings) && Array.isArray(services)) {
        try {
          console.log(`Processing ${bookings.length} bookings for calendar`);
          
          // Get the latest service durations if any services were recently modified
          // This addresses the issue where durations become inaccurate after changes
          const forceRefresh = services.some(s => 
            s._lastModified && (new Date() - new Date(s._lastModified) < 5 * 60 * 1000)
          );
          
          // Now properly await the async function
          const calendarEvents = await bookingsToEvents(bookings, services, forceRefresh);
          console.log('Calendar events generated:', calendarEvents);
          setEvents(calendarEvents);
        } catch (error) {
          console.error('Error generating calendar events:', error);
          // Use more meaningful error message following our authentication improvements approach
          console.error(`Failed to process ${bookings.length} bookings with ${services.length} services.`);
        }
      } else {
        console.warn('Bookings or services data is not in expected format:', { 
          bookingsType: typeof bookings, 
          isBookingsArray: Array.isArray(bookings),
          bookingsLength: bookings?.length,
          servicesType: typeof services, 
          isServicesArray: Array.isArray(services),
          servicesLength: services?.length
        });
      }
    };
    
    // Call the async function
    processBookings();
  }, [bookings, services]);

  // Render component
  return (
    <Box sx={{ flexGrow: 1 }}>
      <DashboardHeader
        title={`${currentUser?.name || 'Hair Artist'}'s Dashboard`}
        calendarView={calendarView}
        onViewChange={handleViewChange}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        loading={loading}
      />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <CalendarView
          calendarView={calendarView}
          events={events}
          loading={loading}
          handleEventClick={handleEventClick}
          handleDatesSet={handleDatesSet}
        />
        
        <AppointmentDetailsDialog
          open={showEventDialog}
          selectedEvent={selectedEvent}
          onClose={handleCloseDialog}
        />
      </Container>
    </Box>
  );
}

export default HairArtistDashboard;
