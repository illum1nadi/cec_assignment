require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const EventEmitter = require('events');
const notifRoutes = require('./routes/notifications');

const app = express();
app.use(cors());
app.use(express.json());

// Create an emitter for new notifications
const notifEmitter = new EventEmitter();
app.locals.notifEmitter = notifEmitter;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('🗄️  NotifDB connected'))
.catch(err => console.error('❌ NotifDB connection error:', err));

// SSE endpoint for notifications per user
app.get('/notifications/stream/:userId', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const onNotif = notif => {
    if (notif.userId.toString() === req.params.userId) {
      res.write(`data: ${JSON.stringify(notif)}\n\n`);
    }
  };

  app.locals.notifEmitter.on('new_notif', onNotif);

  req.on('close', () => {
    app.locals.notifEmitter.off('new_notif', onNotif);
  });
});

// Mount REST routes
app.use('/', notifRoutes);

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Start server
const port = process.env.PORT || 4003;
app.listen(port, () =>
  console.log(`NotificationService listening on port ${port}`)
);
