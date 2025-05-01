import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Button, AppBar, Toolbar, IconButton,
  ToggleButton, ToggleButtonGroup, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { hairArtistService } from '../api/services/hairArtistService';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, parseISO } from 'date-fns';

function HairArtistDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // State for calendar and UI
  const [calendarView, setCalendarView] = useState('timeGridWeek'); // Default to weekly view
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  
  // Refs
  const calendarRef = React.useRef(null);
  
  // Cache state - using an object to store appointments by date
  const [cachedAppointments, setCachedAppointments] = useState({});
  const [cachedDateRanges, setCachedDateRanges] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/hair-artist/login');
  };

  // Check if a date is within any of our cached ranges
  const isDateRangeCached = (start, end) => {
    // If there are no cached ranges, nothing is cached
    if (cachedDateRanges.length === 0) return false;
    
    // Convert dates to timestamps for easier comparison
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    // Check if the entire date range is contained within any of our cached ranges
    for (const range of cachedDateRanges) {
      const cachedStartTime = range.start.getTime();
      const cachedEndTime = range.end.getTime();
      
      if (startTime >= cachedStartTime && endTime <= cachedEndTime) {
        return true;
      }
    }
    
    return false;
  };
  
  // Get the portion of a date range that needs to be fetched
  const getUncachedSubRanges = (start, end) => {
    if (cachedDateRanges.length === 0) {
      // If nothing is cached, we need the entire range
      return [{ start, end }];
    }
    
    // If the entire range is already cached, return empty array
    if (isDateRangeCached(start, end)) {
      return [];
    }
    
    // Sort cached ranges by start date
    const sortedRanges = [...cachedDateRanges].sort((a, b) => 
      a.start.getTime() - b.start.getTime()
    );
    
    // Find gaps in our cached ranges that overlap with the requested range
    const subRanges = [];
    let currentStart = new Date(start);
    
    // Check if we need to fetch anything before the first cached range
    if (currentStart < sortedRanges[0].start && end > sortedRanges[0].start) {
      subRanges.push({
        start: currentStart,
        end: new Date(Math.min(end.getTime(), sortedRanges[0].start.getTime()))
      });
      currentStart = new Date(sortedRanges[0].end);
    }
    
    // Check for gaps between cached ranges
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const gapStart = new Date(Math.max(currentStart.getTime(), sortedRanges[i].end.getTime()));
      const gapEnd = new Date(Math.min(end.getTime(), sortedRanges[i+1].start.getTime()));
      
      if (gapStart < gapEnd) {
        subRanges.push({ start: gapStart, end: gapEnd });
      }
      
      currentStart = new Date(Math.max(currentStart.getTime(), sortedRanges[i+1].end.getTime()));
    }
    
    // Check if we need to fetch anything after the last cached range
    const lastRange = sortedRanges[sortedRanges.length - 1];
    if (currentStart < end && lastRange.end < end) {
      subRanges.push({
        start: new Date(Math.max(currentStart.getTime(), lastRange.end.getTime())),
        end: new Date(end)
      });
    }
    
    return subRanges;
  };

  // Merge a new range into our cached ranges
  const addRangeToCache = (newRange) => {
    // Convert to array of date strings for consistent handling
    const startStr = format(newRange.start, 'yyyy-MM-dd');
    const endStr = format(newRange.end, 'yyyy-MM-dd');
    
    setCachedDateRanges(prevRanges => {
      // Clone the ranges to avoid mutation
      const ranges = [...prevRanges];
      
      // Find overlapping or adjacent ranges to merge
      let merged = false;
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const rangeStartStr = format(range.start, 'yyyy-MM-dd');
        const rangeEndStr = format(range.end, 'yyyy-MM-dd');
        
        // Check if ranges overlap or are adjacent
        const overlaps = (
          (startStr <= rangeEndStr && endStr >= rangeStartStr) ||
          (new Date(startStr) <= new Date(rangeEndStr.getTime() + 86400000) && 
           new Date(endStr) >= new Date(rangeStartStr.getTime() - 86400000))
        );
        
        if (overlaps) {
          // Merge the ranges
          const mergedStart = new Date(Math.min(
            range.start.getTime(),
            newRange.start.getTime()
          ));
          const mergedEnd = new Date(Math.max(
            range.end.getTime(),
            newRange.end.getTime()
          ));
          
          ranges[i] = { start: mergedStart, end: mergedEnd };
          merged = true;
          break;
        }
      }
      
      // If no overlap was found, add as a new range
      if (!merged) {
        ranges.push(newRange);
      }
      
      return ranges;
    });
  };

  const fetchBookings = async (dateInfo, forceRefresh = false) => {
    // If this is a force refresh, clear the cache for this range
    if (forceRefresh) {
      setLoading(true);
      const startDate = format(dateInfo.start, 'yyyy-MM-dd');
      const endDate = format(dateInfo.end, 'yyyy-MM-dd');
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      
      try {
        console.log(`Force refreshing bookings from ${startDate} to ${endDate}`);
        const bookings = await hairArtistService.getBookings(todayDate, startDate, endDate);
        
        // Transform and update events
        const calendarEvents = bookings.map(booking => ({
          id: booking.id,
          title: `${booking.name} - ${booking.service}`,
          start: `${booking.date}T${booking.time}`,
          end: calculateEndTime(booking.date, booking.time),
          extendedProps: {
            ...booking
          }
        }));
        
        setEvents(calendarEvents);
        setLastFetchTime(new Date());
      } catch (err) {
        console.error('Error refreshing bookings:', err);
        setError(err.response?.data?.detail || 'Failed to refresh bookings');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Get the portions of the date range that aren't cached yet
    const uncachedRanges = getUncachedSubRanges(dateInfo.start, dateInfo.end);
    
    if (uncachedRanges.length === 0) {
      console.log('Using cached data - all dates already in cache');
      
      // Collect all events from the cache that fall within the requested range
      const startTime = dateInfo.start.getTime();
      const endTime = dateInfo.end.getTime();
      
      // Filter events from the cached appointments to show only those in the current range
      const filteredEvents = Object.values(cachedAppointments).flat().filter(event => {
        const eventTime = new Date(event.start).getTime();
        return eventTime >= startTime && eventTime <= endTime;
      });
      
      setEvents(filteredEvents);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let allBookingEvents = [];
      
      // Fetch each uncached sub-range
      for (const range of uncachedRanges) {
        const startDate = format(range.start, 'yyyy-MM-dd');
        const endDate = format(range.end, 'yyyy-MM-dd');
        const todayDate = format(new Date(), 'yyyy-MM-dd'); // For backward compatibility
        
        console.log(`Fetching uncached range: ${startDate} to ${endDate}`);
        
        const bookings = await hairArtistService.getBookings(todayDate, startDate, endDate);
        
        // Transform bookings into calendar events
        const rangeEvents = bookings.map(booking => ({
          id: booking.id,
          title: `${booking.name} - ${booking.service}`,
          start: `${booking.date}T${booking.time}`,
          end: calculateEndTime(booking.date, booking.time),
          extendedProps: {
            ...booking
          }
        }));
        
        // Add to our running list
        allBookingEvents = [...allBookingEvents, ...rangeEvents];
        
        // Cache this range and its bookings
        addRangeToCache(range);
        
        // Cache the appointments by date for quick lookup
        setCachedAppointments(prev => {
          const updated = {...prev};
          rangeEvents.forEach(event => {
            const dateKey = event.start.split('T')[0]; // Extract the date part
            if (!updated[dateKey]) updated[dateKey] = [];
            updated[dateKey].push(event);
          });
          return updated;
        });
      }
      
      // Combine newly fetched events with already cached events in the current range
      const startTime = dateInfo.start.getTime();
      const endTime = dateInfo.end.getTime();
      
      const cachedEvents = Object.values(cachedAppointments).flat().filter(event => {
        const eventTime = new Date(event.start).getTime();
        return eventTime >= startTime && eventTime <= endTime;
      });
      
      // Combine and deduplicate events (by ID)
      const combinedEvents = [...cachedEvents, ...allBookingEvents];
      const uniqueEvents = Array.from(new Map(combinedEvents.map(event => [event.id, event])).values());
      
      setEvents(uniqueEvents);
      setLastFetchTime(new Date());
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.detail || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Calculate end time (assuming 1 hour appointments for now)
  const calculateEndTime = (date, time) => {
    const startDateTime = new Date(`${date}T${time}`);
    // Default to 1 hour appointments
    startDateTime.setHours(startDateTime.getHours() + 1);
    return startDateTime.toISOString();
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      // Directly update the calendar API instance to change the view immediately
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(newView);
      }
      // Also update state to keep it in sync
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

  const handleDatesSet = (dateInfo) => {
    fetchBookings(dateInfo);
  };
  
  const handleRefresh = () => {
    // Force a refresh of the current view's data
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentViewDates = {
        start: calendarApi.view.currentStart,
        end: calendarApi.view.currentEnd
      };
      fetchBookings(currentViewDates, true);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hair Artist Dashboard
            {lastFetchTime && (
              <Typography variant="caption" sx={{ ml: 2, opacity: 0.7 }}>
                Last updated: {format(lastFetchTime, 'h:mm a')}
              </Typography>
            )}
          </Typography>
          {currentUser?.is_admin && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/hair-artist/manage')}
                sx={{ mr: 2 }}
              >
                Manage Hair Artists
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/hair-artist/services')}
                sx={{ mr: 2 }}
              >
                Manage Services
              </Button>
            </>
          )}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5">
              Appointment Calendar
            </Typography>
            <Tooltip title="Refresh appointments">
              <IconButton 
                onClick={handleRefresh} 
                size="small" 
                sx={{ ml: 1 }}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <ToggleButtonGroup
            value={calendarView}
            exclusive
            onChange={handleViewChange}
            aria-label="calendar view"
          >
            <ToggleButton value="timeGridDay" aria-label="day view">
              Day
            </ToggleButton>
            <ToggleButton value="timeGridWeek" aria-label="week view">
              Week
            </ToggleButton>
            <ToggleButton value="dayGridMonth" aria-label="month view">
              Month
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 220px)', minHeight: 600 }}>
            {loading && events.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={calendarView}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: ''
                }}
                events={events}
                eventClick={handleEventClick}
                datesSet={handleDatesSet}
                height="100%"
                slotMinTime="08:00:00"
                slotMaxTime="22:30:00"
                allDaySlot={false}
                nowIndicator={true}
                scrollTime={new Date().toISOString().substring(11, 16)}
                slotDuration={'00:30:00'}
                slotLabelInterval={'01:00'}
                snapDuration={'00:30:00'}
                businessHours={{
                  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Sunday - Saturday
                  startTime: '10:00',
                  endTime: '22:00',
                }}
                weekends={true}
              />
            )}
          </Paper>
        </LocalizationProvider>

        {/* Event Detail Dialog */}
        <Dialog open={showEventDialog} onClose={handleCloseDialog}>
          {selectedEvent && (
            <>
              <DialogTitle>
                Appointment Details
              </DialogTitle>
              <DialogContent>
                <Box sx={{ minWidth: 300, p: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {selectedEvent.title}
                  </Typography>
                  <Typography variant="body1">
                    Date: {format(parseISO(selectedEvent.startStr), 'EEEE, MMMM d, yyyy')}
                  </Typography>
                  <Typography variant="body1">
                    Time: {format(parseISO(selectedEvent.startStr), 'h:mm a')}
                  </Typography>
                  <Typography variant="body1">
                    Client: {selectedEvent.extendedProps.name}
                  </Typography>
                  <Typography variant="body1">
                    Email: {selectedEvent.extendedProps.email}
                  </Typography>
                  <Typography variant="body1">
                    Service: {selectedEvent.extendedProps.service}
                  </Typography>
                  <Typography variant="body1">
                    Status: {selectedEvent.extendedProps.status}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}

export default HairArtistDashboard; 