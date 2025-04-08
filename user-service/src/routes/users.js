const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const UserProfile = require('../models/UserProfile');

const router = express.Router();
const NOTIF_URL = process.env.NOTIF_URL;

// — Create Profile —
router.post('/', auth, async (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  const userId = req.user.userId;

  // prevent duplicate profiles
  if (await UserProfile.findOne({ userId })) {
    return res.status(409).json({ error: 'Profile already exists' });
  }

  const profile = new UserProfile({ userId, name, bio, avatarUrl });
  await profile.save();
  res.status(201).json(profile);
});

// — Get Public Profile —
router.get('/:id', async (req, res) => {
  const profile = await UserProfile
    .findOne({ userId: req.params.id })
    .lean()
    .select('-__v');
  if (!profile) return res.status(404).json({ error: 'Not found' });
  res.json(profile);
});

// — Update Profile —
router.put('/:id', auth, async (req, res) => {
  if (req.user.userId !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const updates = (({ name, bio, avatarUrl }) => ({ name, bio, avatarUrl }))(req.body);
  const profile = await UserProfile.findOneAndUpdate(
    { userId: req.params.id },
    updates,
    { new: true, runValidators: true }
  );
  res.json(profile);
});

// — Follow a User —
router.post('/:id/follow', auth, async (req, res) => {
  const me = req.user.userId;
  const them = req.params.id;
  if (me === them) return res.status(400).json({ error: 'Cannot follow yourself' });

  // 1) Add to my following
  await UserProfile.updateOne(
    { userId: me },
    { $addToSet: { following: them } }
  );
  // 2) Add to their followers
  await UserProfile.updateOne(
    { userId: them },
    { $addToSet: { followers: me } }
  );

  // 3) Notify them
  axios.post(`${NOTIF_URL}/notify`, {
    userId: them,
    type: 'new_follower',
    payload: { from: me }
  }).catch(console.error);

  res.json({ message: 'Followed' });
});

module.exports = router;
