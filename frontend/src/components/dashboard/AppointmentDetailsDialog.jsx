import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { format, parseISO } from 'date-fns';

/**
 * Dialog component to display appointment details
 * Used when a user clicks on an event in the calendar
 */
const AppointmentDetailsDialog = ({ 
  open, 
  selectedEvent, 
  onClose 
}) => {
  if (!selectedEvent) return null;

  return (
    <Dialog open={open} onClose={onClose}>
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;
