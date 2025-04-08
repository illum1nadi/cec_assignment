const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// -- REGISTER --
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  // 1) Check for existing user
  if (await User.findOne({ email })) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  // 2) Hash password & save
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  const newUser = new User({ email, passwordHash });
  await newUser.save();

  res.status(201).json({ message: 'User registered' });
});

// -- LOGIN --
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  // 3) Generate tokens
  const payload = { userId: user._id, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
  });

  // 4) (Optional) store refreshToken in DB if you want revocation

  res.json({ accessToken, refreshToken });
});

// -- TOKEN REFRESH --
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'No token provided' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newAccessToken = jwt.sign(
      { userId: payload.userId, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
