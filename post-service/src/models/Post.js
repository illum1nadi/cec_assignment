const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId:   { type: String, required: true },
  authorName: { type: String, required: true },
  content:    { type: String, required: true },
  mediaUrls:  { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
