import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { hairArtistService } from '../api/services/hairArtistService';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/hair-artist/login');
      return;
    }

    fetchHairArtists();
  }, [navigate]);

  const fetchHairArtists = async () => {
    try {
      setLoading(true);
      const data = await hairArtistService.getHairArtists();
      setHairArtists(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch hair artists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddArtist = async () => {
    try {
      setError('');
      await hairArtistService.createHairArtist(newArtist);
      setOpenDialog(false);
      setNewArtist({
        name: '',
        email: '',
        password: '',
        is_admin: false,
      });
      fetchHairArtists();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create hair artist');
    }
  };

  const handleDeleteArtist = async (id) => {
    if (window.confirm('Are you sure you want to delete this hair artist?')) {
      try {
        setError('');
        await hairArtistService.deleteHairArtist(id);
        fetchHairArtists();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete hair artist');
      }
    }
  };

  return (
    <Box>
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
            Hair Artist Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Hair Artist
          </Button>
        </Box>

        <Paper>
          <List>
            {loading ? (
              <ListItem>
                <ListItemText primary="Loading..." />
              </ListItem>
            ) : hairArtists.length === 0 ? (
              <ListItem>
                <ListItemText primary="No hair artists found" />
              </ListItem>
            ) : (
              hairArtists.map((artist) => (
                <ListItem key={artist.id} divider>
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
              ))
            )}
          </List>
        </Paper>

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
            <Button onClick={handleAddArtist} variant="contained" color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default HairArtistManagement; 