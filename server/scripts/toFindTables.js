const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import the Table model
const Table = require('../models/Table');

const restaurantId = '681c001083ae38c43cd70ca5';

async function countTables() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');

    const count = await Table.countDocuments({ restaurant: restaurantId });
    // fallback if type mismatch
    const fallbackCount = await Table.countDocuments({ restaurant: mongoose.Types.ObjectId(restaurantId) });

    console.log(`Count (as string): ${count}`);
    console.log(`Count (as ObjectId): ${fallbackCount}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from DB');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

countTables();
