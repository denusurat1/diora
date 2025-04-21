import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

// Create the Cart Context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Update total quantity whenever cart items change
  useEffect(() => {
    const newTotalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    setTotalQuantity(newTotalQuantity);
  }, [cartItems]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {  // Only save to localStorage when not logged in
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        // If token exists, fetch cart from backend
        const response = await api.get('/auth/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data.items || []);
      } else {
        // If no token, load from localStorage
        const savedCart = localStorage.getItem('cartItems');
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // If error loading from backend, try localStorage as fallback
      const savedCart = localStorage.getItem('cartItems');
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } finally {
      setLoading(false);
    }
  };

  const syncCartWithBackend = async (options = { showToasts: true }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Attempted to sync cart without token');
      return;
    }

    try {
      setLoading(true);
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get local cart items (check both regular and Google-specific storage)
      const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const pendingGoogleCart = JSON.parse(localStorage.getItem('googleAuthPendingCart') || '[]');
      
      console.log('Starting cart sync:', {
        localCartItems: localCart.length,
        pendingGoogleItems: pendingGoogleCart.length,
        hasToken: !!token
      });

      // Combine carts if both exist
      const combinedCart = [...localCart];
      pendingGoogleCart.forEach(newItem => {
        const existingItem = combinedCart.find(item => 
          (item.productId || item.id || item._id) === (newItem.productId || newItem.id || newItem._id)
        );
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          combinedCart.push(newItem);
        }
      });
      
      if (combinedCart.length > 0) {
        console.log('Merging cart with backend:', {
          itemCount: combinedCart.length
        });

        // Merge combined cart with backend
        const mergeResponse = await api.post('/auth/cart/merge', { 
          items: combinedCart.map(item => ({
            productId: item.productId || item.id || item._id,
            name: item.name,
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
            quantity: item.quantity || 1,
            image: item.image
          }))
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (mergeResponse.data && Array.isArray(mergeResponse.data.items)) {
          console.log('Cart merge successful:', {
            mergedItems: mergeResponse.data.items.length
          });

          // Clear all local storage cart data after successful merge
          localStorage.removeItem('cartItems');
          localStorage.removeItem('googleAuthPendingCart');
          setCartItems(mergeResponse.data.items);
          if (options.showToasts && combinedCart.length > 0) {
            toast.success('Cart merged successfully');
          }
          return;
        }
      }

      console.log('Fetching backend cart...');
      // If no local items or merge wasn't needed, just fetch the backend cart
      const response = await api.get('/auth/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data.items)) {
        console.log('Backend cart fetch successful:', {
          items: response.data.items.length
        });
        setCartItems(response.data.items);
        // Clean up any remaining local storage
        localStorage.removeItem('cartItems');
        localStorage.removeItem('googleAuthPendingCart');
      } else {
        throw new Error('Invalid cart data received from server');
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      if (options.showToasts) {
        toast.error('Failed to sync cart with server');
      }
      
      // Keep local cart as fallback if sync fails
      const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const pendingGoogleCart = JSON.parse(localStorage.getItem('googleAuthPendingCart') || '[]');
      setCartItems([...localCart, ...pendingGoogleCart]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (newItem) => {
    try {
      const itemToAdd = {
        productId: newItem.id || newItem._id,
        name: newItem.name,
        price: typeof newItem.price === 'number' ? newItem.price : parseFloat(newItem.price),
        quantity: newItem.quantity || 1,
        image: newItem.image
      };

      const token = localStorage.getItem('token');
      if (token) {
        // If token exists, add to backend cart
        const response = await api.post('/auth/cart/items', itemToAdd, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.items) {
          setCartItems(response.data.items);
          toast.success('Item added to cart');
        }
      } else {
        // If no token, add to local cart
        setCartItems(prevItems => {
          const existingItem = prevItems.find(
            item => item.productId === itemToAdd.productId
          );

          if (existingItem) {
            // If item exists, update quantity
            const updatedItems = prevItems.map(item =>
              item.productId === itemToAdd.productId
                ? { ...item, quantity: item.quantity + itemToAdd.quantity }
                : item
            );
            return updatedItems;
          } else {
            // If item doesn't exist, add it
            return [...prevItems, itemToAdd];
          }
        });
        toast.success('Item added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // If token exists, update backend cart
        const response = await api.put(`/auth/cart/items/${productId}`, { quantity }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.items) {
          setCartItems(response.data.items);
          toast.success('Cart updated');
        }
      } else {
        // If no token, update local cart
        setCartItems(prevItems => {
          if (quantity === 0) {
            return prevItems.filter(item => item.productId !== productId);
          }
          return prevItems.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          );
        });
        toast.success('Cart updated');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // If token exists, remove from backend cart
        const response = await api.delete(`/auth/cart/items/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data.items);
        toast.success('Item removed from cart');
      } else {
        // If no token, remove from local cart
        setCartItems(prevItems => 
          prevItems.filter(item => item.productId !== productId)
        );
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const clearCart = async (options = { showToasts: true }) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // If token exists, clear backend cart
        await api.delete('/auth/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // Always clear local cart state
      setCartItems([]);
      localStorage.removeItem('cartItems');
      if (options.showToasts) {
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      if (options.showToasts) {
        toast.error('Failed to clear cart');
      }
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart,
      syncCartWithBackend,
      updateCartItemQuantity,
      loading,
      getCartTotal,
      totalQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 