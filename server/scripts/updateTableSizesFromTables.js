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

    // Get all tables
    const allTables = await Table.find({});
    
    // Group tables by restaurant ID and count per seat size
    const tableMap = {};

    for (const table of allTables) {
      const restId = table.restaurant.toString();
      const seat = table.seats;

      if (!tableMap[restId]) {
        tableMap[restId] = {};
      }

      if (!tableMap[restId][seat]) {
        tableMap[restId][seat] = 0;
      }

      tableMap[restId][seat]++;
    }

    // Now update restaurants
    for (const restId of Object.keys(tableMap)) {
      const seatObj = tableMap[restId]; // {2: 4, 4: 5, 6: 2}
      const tableSizes = Object.entries(seatObj).map(([size, count]) => ({
        size: parseInt(size),
        count
      }));

      await Restaurant.findByIdAndUpdate(restId, { tableSizes });
    }

    console.log('✅ tableSizes updated for restaurants using real Table data.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    mongoose.connection.close();
  }
})();
