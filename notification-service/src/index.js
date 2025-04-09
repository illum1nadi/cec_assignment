require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const notifRoutes = require('./routes/notifications');

const app = express();
app.use(express.json());

// 1️⃣ Connect to Mongo
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🗄️  NotifDB connected'))
.catch(err => console.error(err));

// 2️⃣ Mount routes
app.use('/', notifRoutes);

// 3️⃣ Health check
app.get('/health', (req, res) => res.send('OK'));

// 4️⃣ Start
app.listen(process.env.PORT, () =>
  console.log(`${process.env.SERVICE_NAME} listening on ${process.env.PORT}`)
);
