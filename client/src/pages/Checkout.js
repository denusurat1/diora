import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import axios from 'axios';

if (typeof document !== 'undefined') {
    Modal.setAppElement('#root');
}

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Calculate the total price of items in the cart
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price.replace('$', ''));
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  // Handle opening the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle order placement with confirmation and save to database
  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          name: item.name,
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price.replace('$', '')),
          quantity: item.quantity,
        })),
        total: parseFloat(getTotalPrice())
      };

      // Send the order to the backend
      await axios.post('http://localhost:3001/api/orders', orderData);

      toast.success('Order placed successfully!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      clearCart();  // Clear the cart after placing the order
      closeModal();  // Close the modal
      navigate('/confirmation');  // Redirect to confirmation page
    } catch (error) {
      toast.error('Failed to place order. Please try again.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error('Error placing order:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9f9f9' }}>
      <h1>Checkout</h1>
      {cartItems.length > 0 ? (
        <div style={{ margin: '1.5rem auto', textAlign: 'left', display: 'inline-block', backgroundColor: '#fff', padding: '1rem', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Order Summary:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cartItems.map((item, index) => (
              <li key={index} style={{ marginBottom: '0.5rem', color: '#555' }}>
                {item.name} - ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price} x {item.quantity} = ${(typeof item.price === 'number' ? item.price : parseFloat(item.price.replace('$', ''))) * item.quantity}
              </li>
            ))}
          </ul>
          <h3 style={{ marginTop: '1rem', color: '#333' }}>Total: ${getTotalPrice()}</h3>
          <button 
            onClick={openModal}
            style={{ 
              marginTop: '1rem', 
              padding: '0.6rem 1.2rem', 
              backgroundColor: 'green', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            Place Order
          </button>
        </div>
      ) : (
        <p>Your cart is empty. Please add some items before checking out.</p>
      )}

      {/* Modal for Order Confirmation */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '2rem',
            borderRadius: '10px',
            textAlign: 'center',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>Confirm Your Order</h2>
        <p style={{ marginBottom: '1rem', color: '#555' }}>Total Amount: ${getTotalPrice()}</p>
        <button 
          onClick={handlePlaceOrder} 
          style={{ 
            padding: '0.6rem 1.2rem', 
            backgroundColor: 'green', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px', 
            margin: '0.5rem', 
            cursor: 'pointer' 
          }}
        >
          Confirm
        </button>
        <button 
          onClick={closeModal} 
          style={{ 
            padding: '0.6rem 1.2rem', 
            backgroundColor: 'red', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px', 
            margin: '0.5rem', 
            cursor: 'pointer' 
          }}
        >
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default Checkout;
