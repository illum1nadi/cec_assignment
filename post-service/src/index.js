require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const EventEmitter = require('events');
const postRoutes = require('./routes/posts');

const app = express();
app.use(cors());
app.use(express.json());

// Create an emitter for new posts
const postEmitter = new EventEmitter();
app.locals.postEmitter = postEmitter;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('🗄️  PostDB connected'))
.catch(err => console.error('❌ PostDB connection error:', err));

// SSE endpoint for new posts
app.get('/posts/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const onPost = post => {
    res.write(`data: ${JSON.stringify(post)}\n\n`);
  };

  postEmitter.on('new_post', onPost);

  req.on('close', () => {
    postEmitter.off('new_post', onPost);
  });
});

// Mount the standard REST routes
app.use('/posts', postRoutes);

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Start server
const port = process.env.PORT || 4002;
app.listen(port, () =>
  console.log(`PostService listening on port ${port}`)
);
