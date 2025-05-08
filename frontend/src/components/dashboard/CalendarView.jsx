import React, { useRef, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Paper
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

/**
 * Calendar component for the Hair Artist Dashboard
 * Displays bookings in a full calendar view
 */
const CalendarView = ({
  calendarView,
  events,
  loading,
  handleEventClick,
  handleDatesSet
}) => {
  const calendarRef = useRef(null);

  // Update calendar view when calendarView prop changes
  useEffect(() => {
    // Debug logging similar to our authentication fixes
    console.log(`Calendar view changing to: ${calendarView}`);
    
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && calendarView) {
      // Use the calendar API to change the view
      calendarApi.changeView(calendarView);
      console.log(`Calendar view successfully updated to: ${calendarView}`);
    }
  }, [calendarView]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 2, height: 'auto', minHeight: 600 }}>
        {loading && events.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={calendarView} // This sets only the initial view
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            events={events}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="22:30:00"
            allDaySlot={false}
            nowIndicator={true}
            scrollTime={new Date().toISOString().substring(11, 16)}
            slotDuration="00:15:00"
            slotLabelInterval="01:00"
            snapDuration="00:15:00"
            businessHours={{
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Sunday - Saturday
              startTime: '08:00',
              endTime: '22:00',
            }}
            weekends={true}
          />
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default CalendarView;
