// scripts/seedRestaurantManagers.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.DB_URI;

const users = [
  {
    first_name: 'Apurva',
    last_name: 'Reddy',
    email: 'apurva@gmail.com',
    password: 'password123',
    phone: '4081213338',
    city: 'Berkeley',
    role: 'RestaurantManager'
  },
  {
    first_name: 'James',
    last_name: 'Gunn',
    email: 'james@gmail.com',
    password: 'password123',
    phone: '4081213334',
    city: 'Oakland',
    role: 'RestaurantManager'
  }
];

async function seedManagers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Optional: Clear existing managers with same emails
    const emails = users.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log('🧹 Removed any existing matching users');

    // Hash passwords and insert
    for (let user of users) {
      const hashed = await bcrypt.hash(user.password, 10);
      user.password = hashed;
    }

    const inserted = await User.insertMany(users);
    console.log(`✅ Successfully seeded ${inserted.length} Restaurant Managers`);

    inserted.forEach(u => {
      console.log(`👤 ${u.first_name} ${u.last_name} - ${u.email}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedManagers();