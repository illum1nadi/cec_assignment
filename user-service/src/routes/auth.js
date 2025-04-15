// user-service/src/routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const axios   = require('axios');

const router = express.Router();
const NOTIF_URL = process.env.NOTIF_URL;

// — Register (creates profile) —
router.post('/register', async (req, res) => {
  const { email, password, name, bio, avatarUrl } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email/password' });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'Email in use' });

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = new User({ email, passwordHash, name, bio, avatarUrl });
  await user.save();

  // Issue tokens
  const payload = { userId: user._id, email: user.email };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

  // Return profile + tokens
  res.status(201).json({
    user: {
      userId:    user._id,
      email:     user.email,
      name:      user.name,
      bio:       user.bio,
      avatarUrl: user.avatarUrl,
      followers: user.followers,
      following: user.following
    },
    accessToken,
    refreshToken
  });
});

// — Login —
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = { userId: user._id, email: user.email };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

  res.json({
    user: {
      userId:    user._id,
      email:     user.email,
      name:      user.name,
      bio:       user.bio,
      avatarUrl: user.avatarUrl,
      followers: user.followers,
      following: user.following
    },
    accessToken,
    refreshToken
  });
});

// — Refresh Token —
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'No token' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newToken = jwt.sign(
      { userId: payload.userId, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ accessToken: newToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
