const express = require('express');
const Notification = require('../models/Notification');
const NotificationPrefs = require('../models/NotificationPrefs');

const router = express.Router();

// — Emit a notification —
router.post('/notify', async (req, res) => {
  const { userId, type, payload } = req.body;
  if (!userId || !type) return res.status(400).send('Missing fields');
  const notif = new Notification({ userId, type, payload });
  await notif.save();
  res.status(201).json(notif);
});

// — Fetch notifications for a user —
router.get('/notifications/:userId', async (req, res) => {
  const notifs = await Notification.find({ userId: req.params.userId, isRead: false })
    .sort({ createdAt: -1 })
    .lean();
  res.json(notifs);
});

// — Acknowledge (mark read) —
router.put('/notifications/:userId/ack', async (req, res) => {
  const { notificationIds } = req.body;
  if (!Array.isArray(notificationIds)) {
    return res.status(400).json({ error: 'notificationIds array required' });
  }
  await Notification.updateMany(
    { _id: { $in: notificationIds }, userId: req.params.userId },
    { $set: { isRead: true } }
  );
  res.json({ message: 'Acknowledged' });
});

// — Update preferences —
router.put('/prefs/:userId', async (req, res) => {
  const prefs = await NotificationPrefs.findOneAndUpdate(
    { userId: req.params.userId },
    req.body,
    { upsert: true, new: true }
  );
  res.json(prefs);
});

module.exports = router;
