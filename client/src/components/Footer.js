import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#333', 
      color: '#fff', 
      padding: '2rem', 
      textAlign: 'center', 
      marginTop: '2rem' 
    }}>
      <p style={{ fontSize: '1.2rem', fontFamily: 'serif', marginBottom: '1rem' }}>
        Diora - Luxury You Deserve
      </p>
      <p style={{ marginBottom: '1rem', color: '#ccc' }}>
        GIA Certified Diamonds. Handcrafted to Perfection.
      </p>
      <div style={{ margin: '1rem 0' }}>
        <a href="https://www.instagram.com" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Instagram</a>
        <a href="https://www.facebook.com" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Facebook</a>
        <a href="https://www.twitter.com" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Twitter</a>
      </div>
      <p style={{ marginTop: '1rem', color: '#aaa' }}>
        &copy; {new Date().getFullYear()} Diora. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
