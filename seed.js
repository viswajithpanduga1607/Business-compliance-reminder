require('dotenv').config();
const mongoose = require('mongoose');
const { Document, RenewalHistory } = require('./models');
const { initialDocuments, initialRenewalHistory } = require('./data/proxyData');

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

  if (!mongoUri) {
    console.error('❌ MONGO_URI is empty in .env. Please provide a valid MongoDB connection string before running seed.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

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

