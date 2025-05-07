import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, MenuItem, Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { bookingService } from '../api/services/bookingService';
import { hairArtistService } from '../api/services/hairArtistService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO, addDays } from 'date-fns';

function BookingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: localStorage.getItem('bookingName') || '',
    contact: localStorage.getItem('bookingContact') || '',
    service: '',
    serviceId: null,
    date: '',
    time: '',
    hair_artist_id: '',
    gender: 'male'
  });
  const [services, setServices] = useState([]);
  const [hairArtists, setHairArtists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateOption, setDateOption] = useState('today');
  const [artistAvailability, setArtistAvailability] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, artistsData] = await Promise.all([
          bookingService.getServices(),
          hairArtistService.getHairArtistsPublic()
        ]);
        setServices(servicesData);
        setHairArtists(artistsData);
      } catch (err) {
        setError('Failed to fetch services and artists');
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const fetchArtistAvailability = useCallback(async (artists, date) => {
    try {
      const availability = {};
      for (const artist of artists) {
        const slots = await bookingService.getAvailableSlots(date, artist.id, formData.serviceId);
        availability[artist.id] = {
          allSlots: slots,
          availableSlots: slots // The backend already returns only available slots
        };
      }
      setArtistAvailability(availability);
    } catch (err) {
      console.error('Error fetching artist availability:', err);
    }
  }, [formData.serviceId]);

  // Fetch availability whenever date, service, or hair artists change
  useEffect(() => {
    if (hairArtists.length > 0) {
      const dateToUse = formData.date || (dateOption === 'today' ? format(new Date(), 'yyyy-MM-dd') : 
                      dateOption === 'tomorrow' ? format(addDays(new Date(), 1), 'yyyy-MM-dd') : '');
      
      if (dateToUse) {
        fetchArtistAvailability(hairArtists, dateToUse);
      }
    }
  }, [formData.date, formData.serviceId, hairArtists, dateOption, fetchArtistAvailability]);

  // Update available slots whenever date, hair artist, or availability changes
  useEffect(() => {
    if (formData.hair_artist_id && artistAvailability[formData.hair_artist_id]) {
      setAvailableSlots(artistAvailability[formData.hair_artist_id].allSlots);
      
      // Auto-select the earliest available time
      const slots = artistAvailability[formData.hair_artist_id].allSlots;
      if (slots.length > 0) {
        setFormData(prev => ({ ...prev, time: slots[0] }));
      } else {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, time: '' }));
    }
  }, [formData.hair_artist_id, artistAvailability]);

  const filteredHairArtists = hairArtists.filter(artist => {
    if (!formData.gender) return true;
    return artist.gender_expertise === 'both' || artist.gender_expertise === formData.gender;
  });

  const filteredServices = services.filter(service => {
    if (!formData.gender) return true;
    return service.gender_specificity === 'both' || service.gender_specificity === formData.gender;
  });

  // Reset service selection when gender changes
  useEffect(() => {
    if (formData.gender) {
      setFormData(prev => ({ ...prev, service: '', serviceId: null }));
    }
  }, [formData.gender]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for service selection to store both name and ID
    if (name === 'service') {
      const selectedService = services.find(service => service.name === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        serviceId: selectedService ? selectedService.id : null 
      }));
      
      // When service changes, reset time selection
      setFormData(prev => ({ ...prev, time: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateOptionChange = (event, newOption) => {
    if (newOption !== null) {
      setDateOption(newOption);
      if (newOption === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const formattedDate = format(today, 'yyyy-MM-dd');
        setFormData(prev => ({ ...prev, date: formattedDate }));
      } else if (newOption === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const formattedDate = format(tomorrow, 'yyyy-MM-dd');
        setFormData(prev => ({ ...prev, date: formattedDate }));
      }
    }
  };

  const handleCustomDateChange = (date) => {
    if (date) {
      setDateOption('custom');
      // Create a new date object to avoid timezone issues
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  };

  const handleGenderChange = (e, newValue) => {
    if (newValue !== null) {
      setFormData(prev => ({ ...prev, gender: newValue, service: '', serviceId: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      // Store name and contact in localStorage
      localStorage.setItem('bookingName', formData.name);
      localStorage.setItem('bookingContact', formData.contact);
      
      // Create the submission data (excluding serviceId which is only used internally)
      const submissionData = {
        name: formData.name,
        contact: formData.contact,
        service: formData.service,
        date: formData.date,
        time: formData.time,
        hair_artist_id: formData.hair_artist_id,
        gender: formData.gender
      };
      
      // First send OTP
      await bookingService.sendOtp(submissionData);
      // Navigate to OTP verification page with form data
      navigate('/verify-otp', { state: submissionData });
    } catch (err) {
      // Handle validation errors from FastAPI
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Handle multiple validation errors
          setError(err.response.data.detail.map(error => error.msg).join(', '));
        } else {
          // Handle single error message
          setError(err.response.data.detail);
        }
      } else {
        setError('Failed to send OTP. Please try again.');
      }
      console.error('Error sending OTP:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Book an Appointment
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Contact (Email)"
          name="contact"
          type="email"
          value={formData.contact}
          onChange={handleChange}
          required
          margin="normal"
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <ToggleButtonGroup
            value={formData.gender}
            exclusive
            onChange={handleGenderChange}
            fullWidth
          >
            <ToggleButton value="male">Male</ToggleButton>
            <ToggleButton value="female">Female</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TextField
          fullWidth
          select
          label="Service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
          margin="normal"
        >
          {filteredServices.map((service) => (
            <MenuItem key={service.id} value={service.name}>
              {service.name} - ${service.price}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ mt: 2, mb: 2 }}>
          <ToggleButtonGroup
            value={dateOption}
            exclusive
            onChange={handleDateOptionChange}
            fullWidth
          >
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="tomorrow">Tomorrow</ToggleButton>
            <ToggleButton value="custom">Pick Date</ToggleButton>
          </ToggleButtonGroup>

          {dateOption === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={formData.date ? parseISO(formData.date) : null}
                onChange={handleCustomDateChange}
                minDate={new Date()}
                sx={{ mt: 2, width: '100%' }}
              />
            </LocalizationProvider>
          )}
        </Box>

        <TextField
          fullWidth
          select
          label="Hair Artist"
          name="hair_artist_id"
          value={formData.hair_artist_id}
          onChange={handleChange}
          required
          margin="normal"
        >
          {filteredHairArtists.map((artist) => (
            <MenuItem key={artist.id} value={artist.id}>
              {artist.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          select
          label={availableSlots.length === 0 ? "No Time Slot Available" : "Time"}
          name="time"
          value={formData.time}
          onChange={handleChange}
          required={availableSlots.length === 0 ? false : true}
          margin="normal"
          disabled={availableSlots.length === 0}
        >
          {availableSlots.map((slot) => (
            <MenuItem key={slot} value={slot}>
              {slot}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
        </Button>
      </Box>
    </Container>
  );
}

export default BookingForm; 