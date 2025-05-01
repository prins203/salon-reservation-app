import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import './ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    gender_specificity: 'both'
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.is_admin) {
      fetchServices();
    }
  }, [currentUser]);

  const fetchServices = async () => {
    try {
      const data = await serviceApi.getAllServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...formData,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price)
      };

      if (editingService) {
        await serviceApi.updateService(editingService.id, serviceData);
      } else {
        await serviceApi.createService(serviceData);
      }
      
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        gender_specificity: 'both'
      });
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      duration: service.duration?.toString() || '',
      price: service.price?.toString() || '',
      gender_specificity: service.gender_specificity || 'both'
    });
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceApi.deleteService(serviceId);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  if (!currentUser?.is_admin) {
    return <div className="unauthorized">You don't have permission to access this page.</div>;
  }

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
            Service Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <div className="service-management">
          <form onSubmit={handleSubmit} className="service-form">
            <div className="form-group">
              <label>Service Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Gender Specificity</label>
              <select
                name="gender_specificity"
                value={formData.gender_specificity}
                onChange={handleInputChange}
              >
                <option value="both">Both</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <button type="submit">
              {editingService ? 'Update Service' : 'Add Service'}
            </button>
          </form>

          <div className="services-list">
            <h3>Existing Services</h3>
            <div className="services-table">
              <div className="table-header">
                <div className="table-cell">Service Name</div>
                <div className="table-cell">Description</div>
                <div className="table-cell">Duration</div>
                <div className="table-cell">Price</div>
                <div className="table-cell">Gender</div>
                <div className="table-cell actions">Actions</div>
              </div>
              {services.map(service => (
                <div key={service.id} className="table-row">
                  <div className="table-cell">{service.name}</div>
                  <div className="table-cell">{service.description}</div>
                  <div className="table-cell">{service.duration} minutes</div>
                  <div className="table-cell">${service.price}</div>
                  <div className="table-cell">{service.gender_specificity}</div>
                  <div className="table-cell actions">
                    <Tooltip title="Edit Service">
                      <IconButton 
                        onClick={() => handleEdit(service)}
                        className="edit-button"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Service">
                      <IconButton 
                        onClick={() => handleDelete(service.id)}
                        className="delete-button"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default ServiceManagement; 