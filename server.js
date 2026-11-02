require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    project: 'BusinessDocument Expiry REST API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: process.env.MONGO_URI ? 'configured' : 'unconfigured',
  });
});

// Designated port
const PORT = process.env.PORT && process.env.PORT.trim() !== '' ? process.env.PORT : 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 BusinessDocument Expiry server running cleanly on port ${PORT}`);
});

module.exports = { app, server };

