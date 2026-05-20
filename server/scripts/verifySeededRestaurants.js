const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('../models/Restaurant');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  await mongoose.connect(process.env.DB_URI);
  const all = await Restaurant.find({ seeded: true });
  console.log('📌 Seeded restaurants:', all);
  await mongoose.disconnect();
})();
