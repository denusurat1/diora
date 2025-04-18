import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  // Fetch product details from the server
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
      }
    };
    fetchProduct();
  }, [id]);

  // Add to cart function with quantity and toast notification
  const handleAddToCart = () => {
    addToCart({ id: product._id, name: product.name, price: product.price, quantity });
    toast.success(`${quantity} ${product.name}(s) added to the cart!`, {
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
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      {product ? (
        <>
          <h1 style={{ marginBottom: '1rem', color: '#333' }}>{product.name}</h1>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '500px', height: '500px', borderRadius: '10px', marginBottom: '1rem' }} 
          />
          <p style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: '#555' }}>{product.description}</p>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>${product.price.toFixed(2)}</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Quantity: 
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                style={{ marginLeft: '0.5rem', padding: '0.3rem', width: '50px', textAlign: 'center', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </label>
          </div>
          <button
            onClick={handleAddToCart}
            style={{ 
              padding: '0.8rem 1.5rem', 
              backgroundColor: '#333', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Add to Cart
          </button>
        </>
      ) : (
        <p>Product not found</p>
      )}
    </div>
  );
};

export default Product;
