import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      error.message = message;
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'No response from server';
    } else {
      // Something else happened
      error.message = 'Request failed';
    }
    return Promise.reject(error);
  }
);

export default api;
