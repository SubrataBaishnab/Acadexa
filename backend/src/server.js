const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- ROUTE IMPORTS ---
const supervisorRoutes = require('./routes/supervisorRoutes');
const professorRoutes = require('./routes/professorRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const deadlineRoutes = require('./routes/deadlineRoutes');
const vivaRoutes = require('./routes/vivaRoutes');
const progressRoutes = require('./routes/progressRoutes');
const thesisArchiveRoutes = require('./routes/thesisArchiveRoutes'); 
const synopsisRoutes = require('./routes/synopsisRoutes'); 
const registrationRoutes = require('./routes/registrationRoutes'); 
const notificationRoutes = require('./routes/notificationRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const applicationTrackerRoutes = require('./routes/applicationTrackerRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// =========================================================================
// --- API ROUTES ---
// =========================================================================
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/deadline', deadlineRoutes);
app.use('/api/viva', vivaRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/archive', thesisArchiveRoutes); 
app.use('/api/synopsis', synopsisRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/applications', applicationTrackerRoutes);

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => { res.json({ status: 'Acadexa Server is running' }); });

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });