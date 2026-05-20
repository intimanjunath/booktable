// scripts/createAdminUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust if your path differs

const MONGO_URI = process.env.DB_URI; // ✅ Use correct env variable

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('lolThisISnotThePassword', 10);

    const admin = new User({
      first_name: 'Praful',
      last_name: 'John',
      email: 'praful.john@gmail.com',
      phone: '5109512345',
      city: 'Fremont',
      role: 'Admin',
      password: hashedPassword
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.disconnect();
  }
}

createAdmin();
