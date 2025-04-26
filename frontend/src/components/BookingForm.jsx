import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, MenuItem, Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { bookingService } from '../api/services/bookingService';
import { hairArtistService } from '../api/services/hairArtistService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';

function BookingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('bookingFormData');
    return savedData ? JSON.parse(savedData) : {
      name: '',
      contact: '',
      service: '',
      date: '',
      time: '',
      hair_artist_id: '',
      gender: 'male'
    };
  });
  const [services, setServices] = useState([]);
  const [hairArtists, setHairArtists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateOption, setDateOption] = useState('today');
  const [artistAvailability, setArtistAvailability] = useState({});

  const fetchArtistAvailability = useCallback(async (artists, date) => {
    try {
      const availability = {};
      for (const artist of artists) {
        try {
          const slots = await bookingService.getAvailableSlots(date, artist.id);
          availability[artist.id] = {
            firstSlot: slots.length > 0 ? slots[0] : 'No slots available',
            allSlots: slots
          };
        } catch (err) {
          availability[artist.id] = {
            firstSlot: 'Error loading availability',
            allSlots: []
          };
        }
      }
      setArtistAvailability(availability);
    } catch (err) {
      console.error('Error fetching artist availability:', err);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesData, artistsData] = await Promise.all([
          bookingService.getServices(),
          hairArtistService.getHairArtistsPublic()
        ]);
        setServices(servicesData);
        setHairArtists(artistsData);
      } catch (err) {
        setError('Failed to load services and artists');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.hair_artist_id) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const selectedDate = dateOption === 'today' ? today : 
                          dateOption === 'tomorrow' ? tomorrow : 
                          formData.date ? parseISO(formData.date) : today;
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  }, [formData.hair_artist_id, dateOption, formData.date]);

  useEffect(() => {
    if (formData.date && hairArtists.length > 0) {
      fetchArtistAvailability(hairArtists, formData.date);
    }
  }, [formData.date, hairArtists, fetchArtistAvailability]);

  useEffect(() => {
    if (formData.date && formData.hair_artist_id && artistAvailability[formData.hair_artist_id]) {
      setAvailableSlots(artistAvailability[formData.hair_artist_id].allSlots);
      
      // Auto-select the earliest available time
      const slots = artistAvailability[formData.hair_artist_id].allSlots;
      if (slots.length > 0) {
        setFormData(prev => ({ ...prev, time: slots[0] }));
      } else {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    }
  }, [formData.date, formData.hair_artist_id, artistAvailability]);

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
      const newFormData = { ...formData, service: '' };
      setFormData(newFormData);
      localStorage.setItem('bookingFormData', JSON.stringify(newFormData));
    }
  }, [formData.gender]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    localStorage.setItem('bookingFormData', JSON.stringify(newFormData));
  };

  const handleDateOptionChange = (event, newOption) => {
    if (newOption !== null) {
      setDateOption(newOption);
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
      const newFormData = { ...formData, gender: newValue, service: '' };
      setFormData(newFormData);
      localStorage.setItem('bookingFormData', JSON.stringify(newFormData));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      // First send OTP
      await bookingService.sendOtp(formData);
      // Navigate to OTP verification page with form data
      navigate('/verify-otp', { state: formData });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
      console.error('Error sending OTP:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Book an Appointment
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
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
            label="Email"
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
            disabled={!formData.date || !formData.hair_artist_id || availableSlots.length === 0}
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
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default BookingForm; 