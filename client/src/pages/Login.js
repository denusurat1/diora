import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get return URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate(returnUrl);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginTop: '2rem'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#333'
        }}>Login</h1>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="email" 
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#555',
                fontSize: '0.9rem'
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#555',
                fontSize: '0.9rem'
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'background-color 0.2s ease'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.setItem('postLoginRedirect', returnUrl);
              loginWithGoogle();
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#4285f4',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'background-color 0.2s ease'
            }}
          >
            Sign in with Google
          </button>

          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Don't have an account?{' '}
            <Link 
              to={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
              style={{
                color: '#333',
                textDecoration: 'underline'
              }}
            >
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 