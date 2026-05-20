// server/server.js
const express       = require('express');
const mongoose      = require('mongoose');
const dotenv        = require('dotenv');
const cors          = require('cors');
const path          = require('path');

// Load .env from server/ directory
dotenv.config({ path: path.resolve(__dirname, './.env') });

const authRoutes       = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const bookingRoutes    = require('./routes/bookingRoutes');
const reviewRoutes     = require('./routes/reviewRoutes');
const lookupRoutes     = require('./routes/lookupRoutes');
const analyticsRoutes  = require('./routes/analyticsRoutes');
const adminRoutes      = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth',        authRoutes);
app.use('/api/restaurants',  restaurantRoutes);
app.use('/api/bookings',     bookingRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api',              lookupRoutes); // /api/locations & /api/cuisines
app.use('/api', analyticsRoutes);
app.use('/api/admin',      adminRoutes);
app.use("/api/google", require("./routes/google"));

// Health check
app.get('/api/test', (req, res) => res.json({ message: 'Server is running fine!' }));

// Connect to MongoDB and start server
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server listening on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
