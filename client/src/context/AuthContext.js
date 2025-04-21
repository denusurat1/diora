import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useCart } from './CartContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { syncCartWithBackend, clearCart } = useCart();

  // Effect to handle cart sync when user state changes
  useEffect(() => {
    const syncCartIfAuthenticated = async () => {
      if (user && localStorage.getItem('token')) {
        console.log('User authenticated, syncing cart...', {
          userId: user.id,
          isGoogleUser: user.authProvider === 'google',
          hasToken: !!localStorage.getItem('token')
        });
        await syncCartWithBackend({ showToasts: true });
      }
    };

    syncCartIfAuthenticated();
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      console.log('Verifying authentication...');
      const response = await api.get('/auth/verify');
      console.log('Auth verification successful:', {
        userId: response.data.user.id,
        isGoogleUser: response.data.user.authProvider === 'google'
      });
      
      setUser(response.data.user);
      // Cart sync will be handled by the user effect
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      clearCart({ showToasts: false });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsAuthenticating(true);
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user: userData } = response.data;
      console.log('Email login successful:', {
        userId: userData.id,
        hasToken: !!token
      });

      // Store the token before setting user
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user (cart sync will be triggered by effect)
      setUser(userData);
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleCallback = async (token) => {
    if (isAuthenticating) return false;
    
    try {
      setIsAuthenticating(true);
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No authentication token received');
      }
      
      console.log('Starting Google authentication callback...');
      
      // Store the guest cart items before proceeding
      const pendingCart = localStorage.getItem('googleAuthPendingCart');
      
      // Clear any existing auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      api.defaults.headers.common['Authorization'] = '';
      
      // Set up new authentication
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Fetching Google user profile...');
      // Get user profile
      const response = await api.get('/auth/google/profile');
      
      if (!response.data || !response.data.user) {
        throw new Error('No user data received');
      }

      // Set up user data
      const userData = {
        ...response.data.user,
        authProvider: 'google',
        isGoogleUser: true
      };

      console.log('Google authentication successful:', {
        userId: userData.id,
        hasToken: !!token,
        hasPendingCart: !!pendingCart
      });

      // If there was a pending cart from before Google auth, restore it
      if (pendingCart) {
        console.log('Restoring pending cart before sync');
        localStorage.setItem('cartItems', pendingCart);
        localStorage.removeItem('googleAuthPendingCart');
      }

      // Store user data and set user state
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Google login successful!');
      return true;
    } catch (error) {
      console.error('Google callback error:', error);
      setError(error.message);
      toast.error('Failed to authenticate with Google');
      
      // Clean up any pending cart data on error
      localStorage.removeItem('googleAuthPendingCart');
      return false;
    } finally {
      setIsAuthenticating(false);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Saving cart before logout...');
        // Attempt to save the current cart state to backend before logout
        try {
          await api.post('/auth/cart/save', null, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Error saving cart before logout:', error);
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      console.log('Clearing auth state and cart...');
      // Clear all local state and storage
      localStorage.removeItem('token');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('user');
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
      clearCart({ showToasts: false });
      toast.info('Logged out successfully');
    }
  };

  const register = async (userData) => {
    try {
      setIsAuthenticating(true);
      const response = await api.post('/auth/register', userData);

      // Store the token before syncing cart
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      
      // Sync cart after successful registration
      await syncCartWithBackend();
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithGoogle = () => {
    // Store current cart items before redirecting
    const currentCart = localStorage.getItem('cartItems');
    if (currentCart) {
      // Store the guest cart temporarily with a special key
      localStorage.setItem('googleAuthPendingCart', currentCart);
    }
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    // Create state object with path and search params
    const state = {
      redirectPath: currentPath,
      searchParams: currentSearch.slice(1)
    };
    
    // Construct the Google login URL with the API URL
    const googleLoginUrl = `${apiUrl}/api/auth/google/login?redirect=${encodeURIComponent(currentPath)}&searchParams=${encodeURIComponent(currentSearch.slice(1))}`;
    
    // Store the full current path for post-login redirect
    localStorage.setItem('postLoginRedirect', currentPath + currentSearch);
    
    // Redirect to Google login
    window.location.href = googleLoginUrl;
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
    logout,
    register,
    loginWithGoogle,
    handleGoogleCallback,
    updateProfile,
    checkAuth,
    isAuthenticating
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