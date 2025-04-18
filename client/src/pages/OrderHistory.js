import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderHistory = () => {
  const [orderHistory, setOrderHistory] = useState([]);

  // Handle clearing the order history
  const handleClearOrderHistory = async () => {
    try {
      await axios.delete('http://localhost:3001/api/orders');
      setOrderHistory([]);
      alert('Order history cleared successfully');
    } catch (err) {
      alert('Error clearing order history');
    }
  };

  // Fetch order history from the database
  useEffect(() => {
    axios.get('http://localhost:3001/api/orders')
      .then(response => setOrderHistory(response.data))
      .catch(err => console.error('Error fetching order history:', err));
  }, []);

  // Calculate the total price of a single order
  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0).toFixed(2);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Order History</h1>
      {orderHistory.length > 0 ? (
        <>
          <button 
            onClick={handleClearOrderHistory} 
            style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Clear Order History
          </button>
          <ul>
            {orderHistory.map((order, index) => (
              <li key={index} style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '5px' }}>
                <strong>Date:</strong> {new Date(order.date).toLocaleString()} <br />
                <strong>Total Items:</strong> {order.items.reduce((total, item) => total + item.quantity, 0)} <br />
                <strong>Total Cost:</strong> ${calculateTotal(order.items)}
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} - ${item.price} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No orders placed yet.</p>
      )}
    </div>
  );
};

export default OrderHistory;
