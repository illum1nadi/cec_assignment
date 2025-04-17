require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const mongoose     = require('mongoose');
const EventEmitter = require('events');
const notifRoutes  = require('./routes/notifications');

const app = express();
app.use(cors());
app.use(express.json());

// SSE emitter for notifications
const notifEmitter = new EventEmitter();
app.locals.notifEmitter = notifEmitter;

// SSE: send last hour + live updates
app.get('/notifications/stream/:userId', async (req, res) => {
  const userId = req.params.userId;

  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection:      'keep-alive'
  });

  // 1) Send last hour’s notifications
  const oneHourAgo = new Date(Date.now() - 60*60*1000);
  const recent = await mongoose.model('Notification').find({
    userId,
    createdAt: { $gte: oneHourAgo }
  }).sort({ createdAt: 1 }).lean();
  recent.forEach(n => res.write(`data: ${JSON.stringify(n)}\n\n`));

  // 2) Subscribe to new notifications
  const onNotify = n => {
    if (n.userId === userId) {
      res.write(`data: ${JSON.stringify(n)}\n\n`);
    }
  };
  notifEmitter.on('notify', onNotify);

  req.on('close', () => {
    notifEmitter.off('notify', onNotify);
  });
});

// Mount REST routes
app.use('/', notifRoutes);

app.get('/health', (req, res) => res.send('OK'));

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('🗄️  NotifDB connected'))
  .catch(err => console.error('❌ NotifDB connection error:', err));

const port = process.env.PORT || 4002;
app.listen(port, () => console.log(`NotificationService listening on port ${port}`));
