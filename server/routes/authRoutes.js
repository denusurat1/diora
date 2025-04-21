const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Initialize Passport and restore authentication state from session
router.use(passport.initialize());

// Google OAuth login route
router.get('/google/login', (req, res, next) => {
  // Get the full redirect path from query parameters
  const redirectPath = req.query.redirect || '/';
  const searchParams = req.query.searchParams || '';
  
  // Combine path and search params, then encode
  const state = encodeURIComponent(
    JSON.stringify({
      redirectPath,
      searchParams
    })
  );
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state,
    prompt: 'select_account'
  })(req, res, next);
});

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: '/login?error=google_auth_failed' 
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error('No user data in request');
        return res.redirect('/login?error=no_user_data');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Initialize cart if it doesn't exist
      if (!req.user.cart) {
        req.user.cart = { items: [], updatedAt: Date.now() };
      }

      // Update last login and save user
      req.user.lastLogin = Date.now();
      await req.user.save();

      // Parse the state parameter
      let redirectUrl = '/';
      try {
        if (req.query.state) {
          const stateData = JSON.parse(decodeURIComponent(req.query.state));
          const { redirectPath, searchParams } = stateData;
          redirectUrl = redirectPath;
          if (searchParams) {
            redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + searchParams;
          }
        }
      } catch (e) {
        console.error('Error parsing state:', e);
      }

      // Construct the frontend URL with cart data
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const userData = {
        token,
        cart: req.user.cart
      };
      const finalRedirectUrl = `${frontendUrl}/auth/google/callback?data=${encodeURIComponent(JSON.stringify(userData))}`;
      
      res.redirect(finalRedirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

// Get Google user profile
router.get('/google/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching Google user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register a new user (local)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      authProvider: 'local'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user (local)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is using Google auth
    if (user.authProvider === 'google') {
      return res.status(400).json({ message: 'Please use Google Sign-In' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        authProvider: user.authProvider,
        cart: user.cart
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findById(req.user.userId);

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's cart
router.get('/cart', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ items: user.cart.items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/cart/items', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { productId, name, price, quantity, image } = req.body;
    const existingItemIndex = user.cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // If item exists, add the new quantity to the existing quantity
      user.cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      // If item doesn't exist, add it
      user.cart.items.push({ productId, name, price, quantity: quantity || 1, image });
    }

    user.cart.updatedAt = Date.now();
    await user.save();
    res.json({ items: user.cart.items });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/cart/items/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart.items = user.cart.items.filter(
      item => item.productId.toString() !== req.params.productId
    );

    user.cart.updatedAt = Date.now();
    await user.save();
    res.json({ items: user.cart.items });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/cart', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart.items = [];
    user.cart.updatedAt = Date.now();
    await user.save();
    res.json({ items: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Merge cart
router.post('/cart/merge', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { items } = req.body;
    user.mergeCartItems(items);
    await user.save();
    
    res.json({ items: user.cart.items });
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 