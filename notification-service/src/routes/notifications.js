const express      = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

// Create a notification (called by Post Service)
router.post('/notify', async (req, res) => {
  try {
    const n = await Notification.create({
      userId:  req.body.userId,
      type:    req.body.type,
      payload: req.body.payload
    });
    req.app.locals.notifEmitter.emit('notify', n.toObject());
    res.status(201).json(n);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all notifications for a user
router.get('/notifications/:userId', async (req, res) => {
  try {
    const nots = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(nots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
