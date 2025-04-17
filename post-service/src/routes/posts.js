const express = require('express');
const axios   = require('axios');
const auth    = require('../middleware/auth');
const Post    = require('../models/Post');

const router = express.Router();
const USER_URL  = process.env.USER_URL;
const NOTIF_URL = process.env.NOTIF_URL;

// Create Post (auth required)
router.post('/', auth, async (req, res) => {
  try {
    // 1) Build post data
    const postData = {
      authorId:  req.user.userId,
      content:   req.body.content,
      mediaUrls: req.body.mediaUrls || []
    };

    // 2) Fetch & attach author's name
    const { data: poster } = await axios.get(
      `${USER_URL}/users/me`,
      { headers: { Authorization: req.headers.authorization } }
    );
    postData.authorName = poster.name || poster.email;

    // 3) Save to DB
    const post = await Post.create(postData);

    // 4) Notify everyone except the author
    const { data: users } = await axios.get(
      `${USER_URL}/users/all`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const message = `${postData.authorName} posted: "${post.content}"`;
    await Promise.all(
      users
        .filter(u => u._id !== req.user.userId)
        .map(u =>
          axios.post(`${NOTIF_URL}/notify`, {
            userId:  u._id,
            type:    'new_post',
            payload: { message }
          })
        )
    );

    // 5) Emit to SSE
    req.app.locals.postEmitter.emit('new_post', post);

    // 6) Return created post
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Feed (public, returns all posts)
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
