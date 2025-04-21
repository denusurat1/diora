const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Merge guest cart with user's cart
router.post('/merge', auth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid items format' });
    }

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    // Use the mergeWithCart method to combine items
    cart.mergeWithCart(items);
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/items', auth, async (req, res) => {
  try {
    const { productId, name, price, quantity, image } = req.body;
    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    const existingItem = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ productId, name, price, quantity: quantity || 1, image });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item quantity in cart
router.put('/items/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => 
      item.productId.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(item => 
        item.productId.toString() !== req.params.productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/items/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      item.productId.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 