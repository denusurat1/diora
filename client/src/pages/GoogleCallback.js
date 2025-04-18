import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get token from URL params
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');
        
        if (error) {
          throw new Error(error);
        }

        if (!token) {
          throw new Error('No token found in URL');
        }

        // Handle the Google callback
        const success = await handleGoogleCallback(token);
        
        if (success) {
          // Get the stored redirect path or default to home
          const redirectPath = localStorage.getItem('postLoginRedirect') || '/';
          localStorage.removeItem('postLoginRedirect'); // Clean up
          navigate(redirectPath, { replace: true });
        } else {
          throw new Error('Failed to complete authentication');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        // Only show error message once and if we haven't shown it before
        if (!hasError) {
          setHasError(true);
          toast.error('Authentication failed. Please try again.');
          navigate('/login', { replace: true });
        }
      } finally {
        setIsProcessing(false);
      }
    };

    // Only process if we haven't encountered an error yet
    if (isProcessing && !hasError) {
      handleAuth();
    }
  }, [location, navigate, handleGoogleCallback, isProcessing, hasError]);

  // Don't render anything if we're not processing anymore
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