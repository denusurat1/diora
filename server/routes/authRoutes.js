const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const User = require('../models/User');
const auth = require('../middleware/auth');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          googleId: profile.id,
          authProvider: 'google',
          password: Math.random().toString(36).slice(-8)
        });
      } else {
        // Update existing user's Google-specific fields if they're logging in with Google
        user.googleId = profile.id;
        user.authProvider = 'google';
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

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

      // Parse the state parameter
      let redirectUrl = '/';
      try {
        if (req.query.state) {
          const stateData = JSON.parse(decodeURIComponent(req.query.state));
          const { redirectPath, searchParams } = stateData;
          
          // Reconstruct the full redirect URL
          redirectUrl = redirectPath;
          if (searchParams) {
            redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + searchParams;
          }
        }
      } catch (e) {
        console.error('Error parsing state:', e);
        // Fall back to default redirect
      }

      // Add token to the redirect URL
      const separator = redirectUrl.includes('?') ? '&' : '?';
      const finalRedirectUrl = `${redirectUrl}${separator}token=${encodeURIComponent(token)}`;
      
      console.log('Redirecting to:', finalRedirectUrl);
      res.redirect(finalRedirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('/login?error=auth_failed');
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
        authProvider: user.authProvider
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

module.exports = router; 