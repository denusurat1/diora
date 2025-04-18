import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      {/* Hero Section */}
      <div style={{ 
        position: 'relative',
        backgroundImage: 'url(/assets/hero-background.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        padding: '3rem 1rem', 
        marginBottom: '2rem', 
        borderRadius: '10px', 
        color: '#fff', 
        textAlign: 'left'
      }}>
        {/* Overlay to darken the background */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.4)', 
          borderRadius: '10px'
        }}></div>

        {/* Text content with proper layering */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          padding: '1rem' 
        }}>
          <h1 style={{ fontFamily: 'serif', color: '#fff', fontSize: '3rem', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Welcome to Diora</h1>
          <p style={{ color: '#ddd', margin: '1rem 0', fontSize: '1.2rem', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            Discover the finest selection of diamonds and gold jewelry crafted for elegance.
          </p>
          <Link to="/catalog" style={{ 
            padding: '0.8rem 2rem', 
            backgroundColor: '#333', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: '5px', 
            marginTop: '1rem', 
            display: 'inline-block' 
          }}>
            Shop Now
          </Link>
        </div>
      </div>

      {/* Why Diora Section */}
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '2rem', 
        margin: '2rem auto', 
        borderRadius: '10px', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
        maxWidth: '1400px' 
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>Why Choose Diora?</h2>
        <p style={{ marginBottom: '1rem', color: '#555' }}>
          At Diora, we believe in delivering only the finest quality jewelry. Our diamonds are 
          <strong> GIA certified</strong> to guarantee authenticity and brilliance. Each piece is meticulously 
          handcrafted, starting from a 3D CAD design to the final quality check, taking approximately 
          <strong> 20 days</strong> from purchase to delivery. You can trust Diora for quality, elegance, and 
          timeless beauty.
        </p>
      </div>

      {/* Featured Products */}
      <h2 style={{ margin: '2rem 0 1rem', color: '#333' }}>Featured Products</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 1, name: 'Diamond Ring', image: '/assets/catalog/ring 1.png' }, 
          { id: 2, name: 'Gold Necklace', image: '/assets/catalog/gold necklace.png' }, 
          { id: 3, name: 'Platinum Bracelet', image: '/assets/catalog/bracelet.png' }
        ].map((product) => (
          <div key={product.id} style={{ 
            backgroundColor: '#fff', 
            padding: '1rem', 
            border: '1px solid #ddd', 
            borderRadius: '10px', 
            width: '250px', 
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s',
          }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', borderRadius: '5px', marginBottom: '0.5rem' }} 
            />
            <h3 style={{ fontFamily: 'serif', color: '#555' }}>{product.name}</h3>
            <p style={{ color: '#888' }}>{product.price}</p>
            <Link to={`/product/${product.id}`} style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#333', 
              color: '#fff', 
              textDecoration: 'none', 
              borderRadius: '5px',
              marginTop: '0.5rem',
              display: 'inline-block'
            }}>
              View Product
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
