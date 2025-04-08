require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🗄️  MongoDB connected'))
.catch(err => console.error('❌ MongoDB error', err));

// 2. Mount routes
app.use('/auth', authRoutes);

// 3. Health check
app.get('/health', (req, res) => res.send('OK'));

// 4. Start server
const port = process.env.PORT;
app.listen(port, () => 
  console.log(`${process.env.SERVICE_NAME} listening on port ${port}`)
);
