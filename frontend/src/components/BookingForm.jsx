import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, MenuItem, Box, Typography, CircularProgress } from '@mui/material';
import { bookingService } from '../api/services/bookingService';
import { hairArtistService } from '../api/services/hairArtistService';

function BookingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    service: '',
    date: '',
    time: '',
    hair_artist_id: ''
  });
  const [services, setServices] = useState([]);
  const [hairArtists, setHairArtists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (formData.date && formData.hair_artist_id) {
      const fetchSlots = async () => {
        try {
          setLoading(true);
          const slots = await bookingService.getAvailableSlots(formData.date, formData.hair_artist_id);
          setAvailableSlots(slots);
        } catch (err) {
          setError('Failed to load available slots');
          console.error('Error fetching slots:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSlots();
    }
  }, [formData.date, formData.hair_artist_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await bookingService.createBooking(formData);
      navigate('/booking/success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create booking');
      console.error('Error creating booking:', err);
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
            {services.map((service) => (
              <MenuItem key={service.id} value={service.name}>
                {service.name} - ${service.price}
              </MenuItem>
            ))}
          </TextField>

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
            {hairArtists.map((artist) => (
              <MenuItem key={artist.id} value={artist.id}>
                {artist.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="date"
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            select
            label="Time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            margin="normal"
            disabled={!formData.date || !formData.hair_artist_id}
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