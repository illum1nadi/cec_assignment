const express = require('express');
const axios   = require('axios');
const auth    = require('../middleware/auth');
const Post    = require('../models/Post');

const router = express.Router();

const USER_URL  = process.env.USER_URL;
const NOTIF_URL = process.env.NOTIF_URL;

// Create Post
router.post('/', auth, async (req, res) => {
  try {
    // 1) Save the post
    const post = new Post({
      authorId: req.user.userId,
      content:  req.body.content,
      mediaUrls:req.body.mediaUrls || []
    });
    await post.save();

    // 2) Lookup poster’s name
    const { data: poster } = await axios.get(
      `${USER_URL}/users/me`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const posterName = poster.name || poster.email;

    // 3) List all *other* users
    const { data: users } = await axios.get(
      `${USER_URL}/users/all`,
      { headers: { Authorization: req.headers.authorization } }
    );

    // 4) Notify each other user
    const message = `${posterName} posted at ${post.createdAt}: "${post.content}"`;
    await Promise.all(users.map(u =>
      axios.post(`${NOTIF_URL}/notify`, {
        userId:  u._id,
        type:    'new_post',
        payload: { message }
      })
    ));

    // 5) Emit for real‑time SSE (only for others)
    req.app.locals.postEmitter.emit('new_post', {
      content:    post.content,
      mediaUrls:  post.mediaUrls,
      createdAt:  post.createdAt,
      authorName: posterName
    });

    // 6) Respond with enriched post
    res.status(201).json({
      content:    post.content,
      mediaUrls:  post.mediaUrls,
      createdAt:  post.createdAt,
      authorName: posterName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Feed for User (excludes own posts)
router.get('/feed', auth, async (req, res) => {
  try {
    // 1) Who they follow?
    const { data: profile } = await axios.get(
      `${USER_URL}/users/me`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const following = profile.following || [];

    // 2) Fetch posts by those they follow, excluding their own
    const raw = await Post.find({
      authorId: { $in: following, $nin: [req.user.userId] }
    })
    .sort({ createdAt: -1 })
    .lean();

    // 3) Enrich with authorName
    const feed = await Promise.all(raw.map(async p => {
      const { data: u } = await axios.get(`${USER_URL}/users/${p.authorId}`);
      return {
        content:    p.content,
        mediaUrls:  p.mediaUrls,
        createdAt:  p.createdAt,
        authorName: u.name || u.email
      };
    }));

    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
