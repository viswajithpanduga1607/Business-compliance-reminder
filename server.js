require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const documentRoutes = require('./routes/documentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Core Middlewares ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Database Connection ───────────────────────────────────────────────────────
connectDB();

// ── Root & Health Routes ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    project: 'BusinessDocument Expiry REST API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      documents: 'GET|POST /api/documents',
      document: 'GET|PUT|DELETE /api/documents/:id',
      renew: 'POST /api/documents/:id/renew',
      history: 'GET /api/documents/:id/history',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: process.env.MONGO_URI ? 'configured' : 'unconfigured',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/documents', documentRoutes);

// ── Global Error Handling ─────────────────────────────────────────────────────
// 404 — must come after all routes
app.use(notFound);
// Central error formatter — must be the very last middleware
app.use(errorHandler);

// ── Server Initialization ─────────────────────────────────────────────────────
const PORT =
  process.env.PORT && process.env.PORT.trim() !== '' ? process.env.PORT : 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 BusinessDocument Expiry server running cleanly on port ${PORT}`);
});

module.exports = { app, server };
