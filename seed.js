require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const { Document, RenewalHistory } = require('./models');
const { initialDocuments, initialRenewalHistory } = require('./data/proxyData');

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  if (!mongoUri) {
    console.error('❌ MONGO_URI is empty in .env. Please provide a valid MongoDB connection string before running seed.');
    process.exit(1);
  }

  const connectWithRetry = async () => {
    try {
      return await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    } catch (err) {
      if (err.message && (err.message.includes('querySrv') || err.code === 'ECONNREFUSED')) {
        console.warn('⚠️  [MongoDB] Local DNS querySrv refused. Applying Google/Cloudflare DNS fallback...');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        return await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
      }
      throw err;
    }
  };

  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await connectWithRetry();
    console.log(`✅ Connected to MongoDB Atlas host: ${conn.connection.host} (DB: ${conn.connection.name})`);

    console.log('Clearing existing documents and renewal histories...');
    await Document.deleteMany({});
    await RenewalHistory.deleteMany({});

    console.log(`Inserting ${initialDocuments.length} seed documents...`);
    await Document.insertMany(initialDocuments);

    console.log(`Inserting ${initialRenewalHistory.length} seed renewal histories...`);
    await RenewalHistory.insertMany(initialRenewalHistory);

    console.log('✅ Database seeded successfully with enterprise compliance proxy data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
