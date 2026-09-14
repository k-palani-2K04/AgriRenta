import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'agrirenta_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (Farmer or Provider)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, state, district, village, location, upiId } = req.body;

    if (!name || !phone || !password || !state || !district || !village) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, phone, password, state, district, village'
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    const defaultUpi = upiId ? upiId.trim() : (role === 'provider' ? `${phone}@upi` : '');

    const user = await User.create({
      name,
      phone,
      password,
      role: role || 'farmer',
      state,
      district,
      village,
      upiId: defaultUpi,
      location: location || { latitude: 16.3067, longitude: 80.4365 }
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        state: user.state,
        district: user.district,
        village: user.village,
        upiId: user.upiId,
        location: user.location
      }
    });
  } catch (error) {
    console.error('[AuthRoute] Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and password'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        state: user.state,
        district: user.district,
        village: user.village,
        upiId: user.upiId || `${user.phone}@upi`,
        location: user.location
      }
    });
  } catch (error) {
    console.error('[AuthRoute] Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// @desc    Update authenticated user's real-time GPS location coordinates
// @route   PUT /api/auth/location
// @access  Private
router.put('/location', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude coordinates'
      });
    }

    req.user.location = {
      latitude: Number(latitude),
      longitude: Number(longitude)
    };

    await req.user.save();

    return res.json({
      success: true,
      message: 'Live GPS location updated successfully',
      location: req.user.location
    });
  } catch (error) {
    console.error('[AuthRoute] Location update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user location'
    });
  }
});

export default router;
