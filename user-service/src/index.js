// user-service/src/index.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('🗄️  UserDB connected'))
.catch(err => console.error('❌ UserDB connection error:', err));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.get('/health', (req, res) => res.send('OK'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`UserService listening on ${port}`));
