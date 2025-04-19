import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
} from '@mui/material';

const BookingForm = () => {
    const navigate = useNavigate();
    const [services] = useState([
        { id: 1, name: 'Hair Cut', price: 30 }
    ]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        service: '',
        date: '',
        time: ''
    });

    const handleDateChange = async (e) => {
        const date = e.target.value;
        setFormData({ ...formData, date });
        
        if (date) {
            try {
                const response = await axios.get(`http://localhost:8000/api/available-slots?date=${date}`);
                setAvailableSlots(response.data);
            } catch (error) {
                console.error('Error fetching slots:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post('http://localhost:8000/api/send-otp', {
                ...formData,
                datetime: `${formData.date}T${formData.time}:00`
            });
            
            // Navigate to OTP verification page with all booking details
            navigate('/verify-otp', { 
                state: { 
                    contact: formData.contact,
                    name: formData.name,
                    service: formData.service,
                    datetime: `${formData.date}T${formData.time}:00`
                } 
            });
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('Failed to submit booking. Please try again.');
        }
    };

    return (
        <Paper elevation={3} className="form-container">
            <Typography variant="h4" component="h2" gutterBottom>
                Book Your Appointment
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    select
                    label="Service"
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    margin="normal"
                >
                    <MenuItem value="">
                        <em>Select a service</em>
                    </MenuItem>
                    {services.map(service => (
                        <MenuItem key={service.id} value={service.name}>
                            {service.name} (${service.price})
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    required
                    value={formData.date}
                    onChange={handleDateChange}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    fullWidth
                    select
                    label="Time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    margin="normal"
                >
                    <MenuItem value="">
                        <em>Select a time slot</em>
                    </MenuItem>
                    {availableSlots
                        .filter(slot => slot.available)
                        .map((slot, index) => (
                            <MenuItem key={index} value={slot.start_time.split('T')[1].slice(0, 5)}>
                                {slot.start_time.split('T')[1].slice(0, 5)}
                            </MenuItem>
                        ))
                    }
                </TextField>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Book Appointment
                </Button>
            </Box>
        </Paper>
    );
};

export default BookingForm; 