// scripts/insertPreparedRestaurants.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Restaurant = require('../models/Restaurant');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const filePath = path.join(__dirname, 'prepared-restaurants-eastbay.json');

(async () => {
  await mongoose.connect(process.env.DB_URI);
  console.log('✅ Connected to MongoDB');

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const restaurants = JSON.parse(data);

    const result = await Restaurant.insertMany(restaurants, { ordered: false });
    console.log(`🍽️ Successfully inserted ${result.length} restaurants.`);
  } catch (err) {
    console.error('❌ Insert failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
})();
