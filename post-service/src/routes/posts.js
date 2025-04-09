const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const Post = require('../models/Post');

const router = express.Router();
const USER_URL = process.env.USER_URL;

// — Create Post —
router.post('/', auth, async (req, res) => {
  const post = new Post({
    authorId: req.user.userId,
    content: req.body.content,
    mediaUrls: req.body.mediaUrls || []
  });
  await post.save();
  res.status(201).json(post);
});

// — Like Post —
router.post('/:postId/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.likes = post.likes.includes(req.user.userId)
    ? post.likes.filter(u => u.toString() !== req.user.userId)
    : [...post.likes, req.user.userId];
  await post.save();
  res.json({ likes: post.likes.length });
});

// — Get Posts by User —
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId query required' });
  const posts = await Post.find({ authorId: userId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(posts);
});

// — Get Feed for User —
router.get('/feed', auth, async (req, res) => {
  // 1) fetch who this user follows
  const { data: profile } = await axios.get(`${USER_URL}/users/${req.user.userId}`);
  const following = profile.following || [];
  // 2) fetch posts
  const feed = await Post.find({ authorId: { $in: following } })
    .sort({ createdAt: -1 })
    .lean();
  res.json(feed);
});

// — Delete Post —
router.delete('/:postId', auth, async (req, res) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.postId,
    authorId: req.user.userId
  });
  if (!post) return res.status(404).json({ error: 'Post not found or not yours' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
