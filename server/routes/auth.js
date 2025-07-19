const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { message: 'Too many login attempts from this IP, please try again after an hour.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { message: 'Too many signup attempts from this IP, please try again after an hour.' }
});

// Joi schemas
const registerSchema = Joi.object({
  email: Joi.string().email().max(80).required(),
  username: Joi.string().min(4).max(40).required(),
  password: Joi.string().min(4).max(40).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(80).required(),
  password: Joi.string().min(4).max(40).required()
});

// Register
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let { email, username, password } = req.body;

    
    email = email.toLowerCase();
    username = username.toLowerCase();

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, password: hashed });

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let { email, password } = req.body;

   
    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
