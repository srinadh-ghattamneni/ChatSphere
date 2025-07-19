const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  maxCapacity: { type: Number, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema);
