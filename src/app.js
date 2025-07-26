require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const { authenticateApiKey } = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const contactRoutes = require('./routes/contactRoutes');
const messageLogRoutes = require('./routes/messageLogRoutes');
const userPreferenceRoutes = require('./routes/userPreferenceRoutes');

const app = express();

// Security & Performance
app.use(helmet());
app.use(compression());
app.use(cors()); // Allow CORS for API access
app.use(express.json({ limit: '2mb' }));

// Rate Limiting
app.use(rateLimiter);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is up and running' });
});

// API Routes (all protected by API key)
app.use('/api/contacts', authenticateApiKey, contactRoutes);
app.use('/api/messages', authenticateApiKey, messageLogRoutes);
app.use('/api/preferences', authenticateApiKey, userPreferenceRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handling
app.use(errorHandler);

module.exports = app;
