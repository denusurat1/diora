import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      // Set axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        // Parse and validate stored user data
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Successfully logged in!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { confirmPassword, ...registerData } = userData;
      const response = await api.post('/auth/register', registerData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Successfully registered!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    // Create state object with path and search params
    const state = {
      redirectPath: currentPath,
      searchParams: currentSearch.slice(1) // remove the leading '?'
    };
    
    // Construct the Google login URL with the API URL
    const googleLoginUrl = `${apiUrl}/api/auth/google/login?redirect=${encodeURIComponent(currentPath)}&searchParams=${encodeURIComponent(currentSearch.slice(1))}`;
    
    // Store the full current path for post-login redirect
    localStorage.setItem('postLoginRedirect', currentPath + currentSearch);
    
    // Redirect to Google login
    window.location.href = googleLoginUrl;
  };

  const handleGoogleCallback = async (token) => {
    // Prevent multiple simultaneous authentication attempts
    if (isAuthenticating) return false;
    
    try {
      setIsAuthenticating(true);
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No authentication token received');
      }
      
      // Set the token in localStorage and axios defaults
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user profile with the token
      const response = await api.get('/auth/google/profile');
      
      if (!response.data || !response.data.user) {
        throw new Error('No user data received');
      }

      // Store user data and update state
      const userData = response.data.user;
      userData.authProvider = 'google'; // Ensure authProvider is set
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } catch (err) {
      // Clear any stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
      
      // Set error state but don't show toast (let the callback component handle it)
      setError('Google authentication failed');
      return false;
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    handleGoogleCallback,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 