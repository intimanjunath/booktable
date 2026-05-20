// scripts/seedTables.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Ensures .env is loaded correctly

const Table = require('../models/Table'); // Update path if needed

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  console.error('❌ Missing DB_URI in .env file. Aborting.');
  process.exit(1);
}

const seedFilePath = path.join(__dirname, 'tables_seed_data.json');

async function seedTables() {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Table.deleteMany({});
    console.log('🧹 Cleared existing table records');

    // Load and insert seed data
    const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));
    await Table.insertMany(seedData);
    console.log(`🚀 Successfully seeded ${seedData.length} table records.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedTables();
