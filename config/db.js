require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Connect to MongoDB using process.env.MONGO_URI.
 * If MONGO_URI is empty or unconfigured, logs a clear notice
 * so the Express server continues to initialize cleanly without crashing.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  if (!mongoUri) {
    console.warn('⚠️  [MongoDB] Connection skipped: MONGO_URI is currently empty in .env. Configure it manually when ready.');
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

