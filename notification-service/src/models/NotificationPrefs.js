const mongoose = require('mongoose');

const PrefsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  email: {
    new_follower: { type: Boolean, default: true },
    post_like:    { type: Boolean, default: true },
    comment:      { type: Boolean, default: true }
  },
  inApp: {
    new_follower: { type: Boolean, default: true },
    post_like:    { type: Boolean, default: true },
    comment:      { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('NotificationPrefs', PrefsSchema);
