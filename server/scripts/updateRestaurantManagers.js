// scripts/updateRestaurantManagers.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Restaurant = require('../models/Restaurant');

const seedFile = path.join(__dirname, 'restaurantManagerUpdates.json');
const MONGO_URI = process.env.DB_URI;

async function updateManagers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const mappings = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));

    let updateCount = 0;

    for (const { restaurant, manager } of mappings) {
      const updated = await Restaurant.findByIdAndUpdate(
        restaurant,
        { manager },
        { new: true }
      );

      if (updated) {
        updateCount++;
        console.log(`🔄 Updated restaurant: ${restaurant} with manager: ${manager}`);
      } else {
        console.warn(`⚠️ Restaurant not found: ${restaurant}`);
      }
    }

    console.log(`\n✅ Updated ${updateCount} restaurant records.`);
  } catch (err) {
    console.error('❌ Error updating managers:', err);
  } finally {
    mongoose.connection.close();
  }
}

updateManagers();
