const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const supervisorRoutes = require('./routes/supervisorRoutes');
const professorRoutes = require('./routes/professorRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const deadlineRoutes = require('./routes/deadlineRoutes');
const vivaRoutes = require('./routes/vivaRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

app.use('/api/supervisors', supervisorRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/deadline', deadlineRoutes);
app.use('/api/viva', vivaRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = 1002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});