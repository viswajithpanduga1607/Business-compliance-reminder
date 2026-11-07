require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

/**
 * Connect to MongoDB using process.env.MONGO_URI.
 * Includes automatic DNS fallback (Google/Cloudflare DNS) to resolve
 * the Windows Node.js `querySrv ECONNREFUSED` issue with MongoDB Atlas SRV records.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  if (!mongoUri) {
    console.warn('⚠️  [MongoDB] Connection skipped: MONGO_URI is currently empty in .env.');
    return null;
  }

  const tryConnect = async () => {
    return await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
  };

  try {
    const conn = await tryConnect();
    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    // Check if error is due to Windows Node.js querySrv failure
    if (error.message && (error.message.includes('querySrv') || error.code === 'ECONNREFUSED')) {
      console.warn('⚠️  [MongoDB] Local DNS querySrv refused. Applying Google/Cloudflare DNS fallback...');
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await tryConnect();
        console.log(`✅ [MongoDB] Connected successfully via DNS fallback: ${conn.connection.host} (DB: ${conn.connection.name})`);
        return conn;
      } catch (retryError) {
        console.error(`❌ [MongoDB] Connection error after DNS retry: ${retryError.message}`);
        process.exit(1);
      }
    } else {
      console.error(`❌ [MongoDB] Connection error: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
