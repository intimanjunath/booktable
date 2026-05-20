// server/scripts/cleanup.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load the .env from server/ directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function clearAllCollections() {
  try {
    if (!process.env.DB_URI) {
      throw new Error('DB_URI is not defined in .env');
    }

    // Connect to Atlas
    await mongoose.connect(process.env.DB_URI, {
      // these options are now defaults in driver v4+
    });
    console.log('✅ Connected to MongoDB Atlas for cleanup');

    // Get native driver db object
    const db = mongoose.connection.db;

    // List and drop each collection
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('ℹ️  No collections found to drop.');
    } else {
      for (const { name } of collections) {
        await db.dropCollection(name);
        console.log(`🗑 Dropped collection: ${name}`);
      }
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('🔒 Disconnected. Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup error:', err);
    process.exit(1);
  }
}

clearAllCollections();
