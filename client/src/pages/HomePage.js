// client/src/pages/HomePage.js

import React, { useState, useEffect } from 'react';

// HomePage Component - Displays the home page content
function HomePage() {
  const [message, setMessage] = useState('');

  // Fetch message from the server when the component loads
  useEffect(() => {
    fetch('http://localhost:5000/api/home')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div style={styles.container}>
      <h1>{message || 'Loading...'}</h1>
      <p>Welcome to the Diora e-commerce platform!</p>
    </div>
  );
}

// Inline CSS for the component
const styles = {
  container: {
    textAlign: 'center',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '600px',
    backgroundColor: '#f9f9f9'
  }
};

export default HomePage;
