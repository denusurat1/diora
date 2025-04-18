import React, { createContext, useState, useEffect } from 'react';

// Create the Cart Context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load cart items from local storage or set to an empty array
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Load order history from local storage or set to an empty array
  const [orderHistory, setOrderHistory] = useState(() => {
    const savedOrders = localStorage.getItem('orderHistory');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Save cart items to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save order history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  }, [orderHistory]);

  // Add item to cart
  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      // Normalize the item ID field to ensure consistency
      const itemId = newItem.id || newItem._id;
      const existingItem = prevItems.find(item => item.id === itemId || item._id === itemId);
      
      if (existingItem) {
        // If the item already exists, update the quantity
        return prevItems.map(item =>
          (item.id === itemId || item._id === itemId) 
            ? { ...item, quantity: item.quantity + newItem.quantity } 
            : item
        );
      } else {
        // If the item does not exist, add it as a new entry
        return [...prevItems, { ...newItem, id: itemId, quantity: newItem.quantity || 1 }];
      }
    });
  };

  // Add order to order history
  const addOrder = (newOrder) => {
    setOrderHistory((prevOrders) => [...prevOrders, newOrder]);
  };

  // Clear the order history
  const clearOrderHistory = () => {
    setOrderHistory([]);
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== id && item._id !== id));
  };

  // Clear the cart after placing an order
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      addOrder, 
      orderHistory, 
      clearOrderHistory 
    }}>
      {children}
    </CartContext.Provider>
  );
}; 