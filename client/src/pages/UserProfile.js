import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    postalCode: user?.postalCode || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/users/profile', formData);
      updateProfile(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.delete('/api/users/profile');
        logout();
        navigate('/');
        toast.success('Account deleted successfully');
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>
      
      {!isEditing ? (
        <div className="profile-info">
          <div className="profile-header">
            <div className="user-avatar">
              {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.email}</p>
              <p className="auth-type">
                {user.authProvider === 'google' ? 'Google Account' : 'Local Account'}
              </p>
            </div>
          </div>

          <div className="info-section">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
          </div>

          <div className="info-section">
            <h4>Address Information</h4>
            <p><strong>Address:</strong> {user.address || 'Not provided'}</p>
            <p><strong>City:</strong> {user.city || 'Not provided'}</p>
            <p><strong>Country:</strong> {user.country || 'Not provided'}</p>
            <p><strong>Postal Code:</strong> {user.postalCode || 'Not provided'}</p>
          </div>
          
          <div className="button-group">
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit Profile
            </button>
            <button onClick={handleDeleteAccount} className="delete-button">
              Delete Account
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={user.authProvider === 'google'}
            />
            {user.authProvider === 'google' && (
              <small className="form-help">Email cannot be changed for Google accounts</small>
            )}
          </div>
          
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Postal Code:</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="button-group">
            <button type="submit" className="save-button">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile; 