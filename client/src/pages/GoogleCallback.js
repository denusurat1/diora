import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let hasHandled = false;

    const handleAuth = async () => {
      if (hasHandled) return;
      hasHandled = true;

      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
          console.error('Authentication error:', error);
          toast.error('Authentication failed. Please try again.', { toastId: 'google-auth-error' });
          navigate('/login', { replace: true });
          return;
        }

        if (!token) {
          console.error('No token found in URL');
          toast.error('No token found. Please try again.', { toastId: 'google-no-token' });
          navigate('/login', { replace: true });
          return;
        }

        const success = await handleGoogleCallback(token);

        if (success) {
          toast.success('Successfully signed in with Google!', { toastId: 'google-login-success' });
          const redirectPath = localStorage.getItem('postLoginRedirect') || '/';
          localStorage.removeItem('postLoginRedirect');
          navigate(redirectPath, { replace: true });
        } else {
          toast.error('Failed to complete authentication', { toastId: 'google-auth-fail' });
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Google callback error:', err);
        toast.error('Something went wrong. Please try again.', { toastId: 'google-callback-error' });
        navigate('/login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    if (isProcessing) {
      handleAuth();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isProcessing) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          color: '#333',
          fontFamily: 'Playfair Display, serif'
        }}>
          Processing Google Sign In...
        </h2>
        <p style={{ color: '#666' }}>Please wait while we complete your authentication.</p>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default GoogleCallback; 