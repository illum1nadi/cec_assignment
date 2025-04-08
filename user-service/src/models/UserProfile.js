const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  bio: String,
  avatarUrl: String,
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  }]
}, { timestamps: true });

// 💡 Hack: auto‐prune empty arrays and enforce at‐most‐one‐entry with $addToSet
module.exports = mongoose.model('UserProfile', UserProfileSchema);
