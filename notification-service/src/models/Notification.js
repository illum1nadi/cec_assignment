const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  type: {
    type: String,
    enum: ['new_follower','post_like','comment','system'],
    required: true
  },
  payload: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true });

// TTL: auto-delete read notifications after 30 days
NotificationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30*24*3600 });

module.exports = mongoose.model('Notification', NotificationSchema);
