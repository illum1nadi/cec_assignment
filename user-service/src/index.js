require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/users');

const app = express();
app.use(express.json());

// 1️⃣ Connect to Mongo
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🗄️  UserDB connected'))
.catch(err => console.error(err));

// 2️⃣ Mount routes
app.use('/users', userRoutes);

// 3️⃣ Health check
app.get('/health', (req, res) => res.send('OK'));

// 4️⃣ Start
const port = process.env.PORT;
app.listen(port, () =>
  console.log(`${process.env.SERVICE_NAME} listening on ${port}`)
);
