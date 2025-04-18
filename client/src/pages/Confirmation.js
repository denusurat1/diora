import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaCheckCircle } from 'react-icons/fa';

const Confirmation = () => {
  // Access the order history from context
  const { orderHistory } = useContext(CartContext);
  const [latestOrder, setLatestOrder] = useState(null);

  // Get the most recent order after the page loads
  useEffect(() => {
    if (orderHistory.length > 0) {
      setLatestOrder(orderHistory[orderHistory.length - 1]);
    }
  }, [orderHistory]);

  // Calculate the total price of the order
  const getTotalPrice = (items) => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  return (
    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9f9f9' }}>
      <FaCheckCircle size={60} color="green" style={{ marginBottom: '1rem' }} />
      <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Thank You for Your Order!</h1>
      <p style={{ color: '#555' }}>Your order has been placed successfully.</p>
      <p style={{ color: '#555', marginBottom: '1rem' }}>You will receive a confirmation email shortly.</p>

      {/* Display order summary if available */}
      {latestOrder && (
        <div style={{ margin: '1.5rem auto', textAlign: 'left', display: 'inline-block', backgroundColor: '#fff', padding: '1rem', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Order Summary:</h3>
          <p style={{ color: '#666' }}><strong>Date:</strong> {latestOrder.date}</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {latestOrder.items.map((item, index) => (
              <li key={index} style={{ marginBottom: '0.5rem', color: '#555' }}>
                {item.name} - {item.price} x {item.quantity} = ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <h3 style={{ color: '#333', marginTop: '1rem' }}>Total: ${getTotalPrice(latestOrder.items)}</h3>
        </div>
      )}

      {/* Button Container for navigation */}
      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/" style={{ margin: '0 10px', padding: '0.6rem 1.2rem', backgroundColor: '#333', color: '#fff', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
          Go Back to Home
        </Link>
        <Link to="/order-history" style={{ margin: '0 10px', padding: '0.6rem 1.2rem', backgroundColor: '#555', color: '#fff', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
          View Order History
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;
