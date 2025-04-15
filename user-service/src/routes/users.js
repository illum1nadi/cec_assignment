const express = require('express');
const axios   = require('axios');
const auth    = require('../middleware/auth');
const User    = require('../models/User');

const router = express.Router();
const NOTIF_URL = process.env.NOTIF_URL;

// Get my profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).lean().select('-passwordHash -__v');
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// Update my profile
router.put('/me', auth, async (req, res) => {
  const updates = (({ name, bio, avatarUrl }) => ({ name, bio, avatarUrl }))(req.body);
  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).lean().select('-passwordHash -__v');
  res.json(user);
});
// user-service/src/routes/users.js
// GET /users/all  → list all users except the caller
router.get('/all', auth, async (req, res) => {
  const others = await User.find(
    { _id: { $ne: req.user.userId } },
    'name email'  // only return name & email
  ).lean();
  res.json(others);
});

module.exports = router;


// Follow another user
router.post('/:id/follow', auth, async (req, res) => {
  const me   = req.user.userId;
  const them = req.params.id;
  if (me === them) return res.status(400).json({ error: 'Cannot follow yourself' });

  await User.findByIdAndUpdate(me,   { $addToSet: { following: them } });
  await User.findByIdAndUpdate(them, { $addToSet: { followers: me } });

  // Notify them
  axios.post(`${NOTIF_URL}/notify`, {
    userId: them,
    type:   'new_follower',
    payload:{ from: me }
  }).catch(console.error);

  res.json({ message: 'Followed' });
});

module.exports = router;
