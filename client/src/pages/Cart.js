import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  // Access cart items and remove function from CartContext
  const { cartItems, removeFromCart } = useContext(CartContext);

  // Function to calculate the total price of items in the cart
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      // Check if the price is a number or a string and parse accordingly
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price.replace('$', ''));
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  return (
    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9f9f9' }}>
      <h1>Your Cart</h1>
      {/* Check if there are items in the cart */}
      {cartItems.length > 0 ? (
        <div style={{ margin: '1.5rem auto', textAlign: 'left', display: 'inline-block', backgroundColor: '#fff', padding: '1rem', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Your Items:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {/* Map through cart items and display each one */}
            {cartItems.map((item, index) => (
              <li key={item.id} style={{ marginBottom: '0.5rem', color: '#555' }}>
                {item.name} - {typeof item.price === 'number' ? item.price.toFixed(2) : item.price} x {item.quantity}
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  style={{ 
                    marginLeft: '10px', 
                    backgroundColor: 'red', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '5px', 
                    cursor: 'pointer' 
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <h3 style={{ marginTop: '1rem', color: '#333' }}>Total: ${getTotalPrice()}</h3>
          {/* Link to proceed to checkout */}
          <Link to="/checkout" style={{ marginTop: '1rem', display: 'inline-block', padding: '0.6rem 1.2rem', backgroundColor: 'green', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
            Proceed to Checkout
          </Link>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>Your cart is empty. Start adding your favorite jewelry!</p>
          <Link to="/catalog" style={{ padding: '0.5rem 1rem', backgroundColor: '#333', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
            Browse Catalog
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
