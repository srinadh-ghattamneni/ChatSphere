const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// JWT auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// ======== Rate Limiters ========

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
});

const createRoomLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: 'Too many room creation attempts, try again later.' },
});

const joinRoomLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { message: 'Too many join attempts, slow down.' },
});

const deleteRoomLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { message: 'Too many delete attempts. Try again later.' },
});

// Apply general limiter to all routes
router.use(generalLimiter);

// Joi schema for room creation validation
const roomSchema = Joi.object({
  name: Joi.string().max(20).required(),
  code: Joi.string().length(6).required(),
  maxCapacity: Joi.number().min(2).max(100).required()
});

// ========== Routes ==========

// Create room
router.post('/room', auth, createRoomLimiter, async (req, res) => {
  try {
    const { error } = roomSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const userRoomCount = await Room.countDocuments({ owner: req.user.id });
    if (userRoomCount >= 10) {
      return res.status(403).json({ message: 'You can only create up to 10 rooms. Delete an existing room to create a new one.' });
    }

    const { name, code, maxCapacity } = req.body;
    const exists = await Room.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Room code already exists' });

    const room = await Room.create({
      name,
      code,
      maxCapacity,
      users: [req.user.id],
      owner: req.user.id
    });

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join room
router.post('/room/:code/join', auth, joinRoomLimiter, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.users.length >= room.maxCapacity) return res.status(403).json({ message: 'Room full' });

    if (!room.users.includes(req.user.id)) {
      room.users.push(req.user.id);
      await room.save();
    }

    res.json({ message: 'Joined room' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rooms owned by logged-in user
router.get('/my-rooms', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user.id });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a room by code
router.delete('/room/:code', auth, deleteRoomLimiter, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await Message.deleteMany({ room: room._id });
    await Room.deleteOne({ _id: room._id });

    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room details
router.get('/room/:code', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all messages for a room
router.get('/room/:code/messages', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const messages = await Message.find({ room: room._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
