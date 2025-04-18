import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching products...');
        const response = await api.get('/products');
        console.log('Products received:', response.data);
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to load products');
        toast.error('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading Products...</h2>
          <p>Please wait while we fetch the catalog.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>Error Loading Products</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    addToCart({ 
      id: product._id,
      name: product.name, 
      price: product.price, 
      quantity: 1, 
      image: product.image 
    });
    toast.success(`${product.name} added to cart!`, {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>Our Collection</h1>
      <div style={{ 
        display: 'grid', 
        gap: '2rem', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
      }}>
        {products.map((product) => (
          <div key={product._id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '10px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
            transition: 'transform 0.2s ease', 
            backgroundColor: '#fff',
            textAlign: 'center'
          }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', height: 'auto', borderBottom: '1px solid #ddd' }} 
            />
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0.5rem 0', fontFamily: 'serif', color: '#555' }}>{product.name}</h3>
              <p style={{ margin: '0.5rem 0', color: '#888' }}>${product.price.toFixed(2)}</p>
              <div>
                <Link to={`/product/${product._id}`} style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#333', 
                  color: '#fff', 
                  textDecoration: 'none', 
                  borderRadius: '5px', 
                  margin: '0.5rem', 
                  cursor: 'pointer',
                  display: 'inline-block',
                  fontSize: '1rem'
                }}>
                  View Details
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }} 
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#333', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '5px', 
                    margin: '0.5rem', 
                    cursor: 'pointer',
                    display: 'inline-block',
                    fontSize: '1rem'
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
