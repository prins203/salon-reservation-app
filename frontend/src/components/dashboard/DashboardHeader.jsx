import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import DesignServicesIcon from '@mui/icons-material/DesignServices';

/**
 * Header component for the dashboard
 * Contains title, view controls, and action buttons
 */
const DashboardHeader = ({
  title,
  calendarView,
  onViewChange,
  onRefresh,
  onLogout,
  loading
}) => {
  return (
    <AppBar position="static" color="primary" sx={{ marginBottom: 2 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Management Links */}
          <Button
            component={RouterLink}
            to="/hair-artist/manage"
            startIcon={<PeopleIcon />}
            sx={{ color: 'white', mr: 1 }}
            size="small"
          >
            Manage Staff
          </Button>
          <Button
            component={RouterLink}
            to="/hair-artist/services"
            startIcon={<DesignServicesIcon />}
            sx={{ color: 'white', mr: 1 }}
            size="small"
          >
            Manage Services
          </Button>
          
          {/* Action Buttons */}
          <Tooltip title="Refresh Appointments">
            <IconButton 
              onClick={onRefresh} 
              size="small" 
              sx={{ ml: 1, color: 'white' }}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton 
              onClick={onLogout} 
              size="small" 
              sx={{ ml: 1, color: 'white' }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      <Box sx={{ bgcolor: '#f5f5f5', p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            Calendar View
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={calendarView}
          exclusive
          onChange={onViewChange}
          aria-label="calendar view"
          size="small"
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
    </AppBar>
  );
};

export default DashboardHeader;
