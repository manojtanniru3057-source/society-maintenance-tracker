const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, flatNumber, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  // Prevent self-elevating to admin via the public register route
  const assignedRole = role === 'admin' ? 'resident' : (role || 'resident');

  const user = await User.create({ name, email, password, flatNumber, role: assignedRole });

  const token = signToken(user._id);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, flatNumber: user.flatNumber },
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, flatNumber: user.flatNumber },
  });
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const { _id, name, email, role, flatNumber } = req.user;
  res.json({ id: _id, name, email, role, flatNumber });
});

module.exports = router;
