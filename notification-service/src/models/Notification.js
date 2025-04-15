const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true
  },
  type: {
    type: String,
    enum: ['new_follower', 'post_like', 'comment', 'new_post'],  // <-- added 'new_post'
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
