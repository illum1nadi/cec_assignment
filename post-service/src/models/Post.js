const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
    index: true
  },
  content: { type: String, required: true },
  mediaUrls: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile'
  }],
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Compound index to speed feed queries
PostSchema.index({ authorId: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
