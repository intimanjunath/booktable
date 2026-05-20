const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');

const MONGO_URI = process.env.DB_URI;

if (!MONGO_URI) {
  console.error('❌ DB_URI not found in .env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Get all tables, grouped by restaurant
    const allTables = await Table.find({});

    const restaurantTableMap = {};

    for (const table of allTables) {
      const restId = table.restaurant.toString();
      if (!restaurantTableMap[restId]) {
        restaurantTableMap[restId] = [];
      }
      restaurantTableMap[restId].push(table._id);
    }

    // Step 2: Update each restaurant with its tables
    for (const [restId, tableIds] of Object.entries(restaurantTableMap)) {
      const restaurant = await Restaurant.findById(restId);
      if (!restaurant) {
        console.warn(`⚠️ Restaurant not found for ID: ${restId} — skipping.`);
        continue;
      }

      restaurant.tables = tableIds;
      await restaurant.save();
      console.log(`✅ Updated restaurant ${restaurant.name} (${restId}) with ${tableIds.length} tables.`);
    }

    console.log('🎉 All restaurants updated with their table references!');
  } catch (err) {
    console.error('❌ Error during population:', err);
  } finally {
    mongoose.connection.close();
  }
})();
