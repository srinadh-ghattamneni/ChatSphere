require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
const allowCredentials = process.env.CORS_CREDENTIALS === 'true';
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: allowedOrigin,
    methods: allowedMethods,
    credentials: allowCredentials
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigin,
  methods: allowedMethods,
  credentials: allowCredentials
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  tlsAllowInvalidCertificates: true,
  autoSelectFamily: false
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io logic
const socketUserMap = new Map();

io.on('connection', (socket) => {
  socket.on('joinRoom', async ({ code, username }) => {
    try {
      const Room = require('./models/Room');
      const User = require('./models/User');

      const room = await Room.findOne({ code });
      const user = await User.findOne({ username: username.toLowerCase() });
      if (!room || !user) return;

      await Room.updateOne({ code }, { $pull: { users: user._id } });

      const updatedRoom = await Room.findOne({ code });
      if (updatedRoom.users.length >= updatedRoom.maxCapacity) return;

      updatedRoom.users.push(user._id);
      await updatedRoom.save();

      socket.join(code);
      socketUserMap.set(socket.id, { code, username: username.toLowerCase() });

      io.in(code).emit('userCount', { count: updatedRoom.users.length });
    } catch (err) {
      console.error('joinRoom error:', err);
    }
  });

  socket.on('leaveRoom', async ({ code, username }) => {
    try {
      const Room = require('./models/Room');
      const User = require('./models/User');

      const room = await Room.findOne({ code });
      const user = await User.findOne({ username: username.toLowerCase() });
      socket.leave(code);

      if (room && user) {
        await Room.updateOne({ code }, { $pull: { users: user._id } });
        const updatedRoom = await Room.findOne({ code });
        io.in(code).emit('userCount', { count: updatedRoom.users.length });
      }

      socketUserMap.delete(socket.id);
    } catch (err) {
      console.error('leaveRoom error:', err);
    }
  });

  socket.on('sendMessage', async ({ code, username, content }) => {
    try {
      const Room = require('./models/Room');
      const Message = require('./models/Message');
      const User = require('./models/User');

      const room = await Room.findOne({ code });
      const user = await User.findOne({ username: username.toLowerCase() });
      if (!room || !user) return;

      const trimmedContent = content.length > 3000 ? content.slice(0, 3000) : content;

      const msg = await Message.create({
        room: room._id,
        sender: user._id,
        username,
        content: trimmedContent
      });

      io.in(code).emit('event', {
        username,
        content: trimmedContent,
        createdAt: msg.createdAt
      });
    } catch (err) {
      console.error('sendMessage error:', err);
    }
  });

  socket.on('disconnect', async () => {
    const info = socketUserMap.get(socket.id);
    if (!info) return;

    const { code, username } = info;

    try {
      const Room = require('./models/Room');
      const User = require('./models/User');

      const room = await Room.findOne({ code });
      const user = await User.findOne({ username: username.toLowerCase() });

      if (room && user) {
        await Room.updateOne({ code }, { $pull: { users: user._id } });
        const updatedRoom = await Room.findOne({ code });
        io.in(code).emit('userCount', { count: updatedRoom.users.length });
      }
    } catch (err) {
      console.error('disconnect error:', err);
    }

    socketUserMap.delete(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
