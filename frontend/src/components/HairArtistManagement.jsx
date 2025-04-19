import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Container,
  AppBar,
  Toolbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const HairArtistManagement = () => {
  const navigate = useNavigate();
  const [hairArtists, setHairArtists] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newArtist, setNewArtist] = useState({
    name: '',
    email: '',
    password: '',
    is_admin: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/hair-artist/login');
      return;
    }

    fetchHairArtists(token);
  }, [navigate]);

  const fetchHairArtists = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/hair-artists/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHairArtists(response.data);
    } catch (error) {
      console.error('Error fetching hair artists:', error);
      setError('Failed to load hair artists');
    }
  };

  const handleAddArtist = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/hair-artists/', newArtist, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDialog(false);
      setNewArtist({ name: '', email: '', password: '', is_admin: false });
      fetchHairArtists(token);
    } catch (error) {
      console.error('Error adding hair artist:', error);
      setError('Failed to add hair artist');
    }
  };

  const handleDeleteArtist = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/hair-artists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHairArtists(token);
    } catch (error) {
      console.error('Error deleting hair artist:', error);
      setError('Failed to delete hair artist');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/hair-artist/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Manage Hair Artists
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Hair Artist
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <List>
            {hairArtists.map((artist) => (
              <ListItem key={artist.id}>
                <ListItemText
                  primary={artist.name}
                  secondary={`${artist.email} ${artist.is_admin ? '(Admin)' : ''}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteArtist(artist.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Hair Artist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newArtist.name}
            onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newArtist.email}
            onChange={(e) => setNewArtist({ ...newArtist, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newArtist.password}
            onChange={(e) => setNewArtist({ ...newArtist, password: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={newArtist.is_admin}
                onChange={(e) => setNewArtist({ ...newArtist, is_admin: e.target.checked })}
              />
            }
            label="Admin"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddArtist}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HairArtistManagement; 