// server/controllers/authController.js
const User   = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ——————————————————
// 1) Customer Registration
// ——————————————————
async function registerUser(req, res) {
  try {
    const { first_name, last_name, email, password, phone, city } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'first_name, last_name, email, and password are required' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      first_name,
      last_name,
      email,           // case‐sensitive
      password: hash,
      phone,
      city,
      role: 'Customer' // default
    });
    await user.save();
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('registerUser error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
}

// ——————————————————
// 2) Login (all roles)
// ——————————————————
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // Case‐sensitive lookup to match your seeded “Priya@admin.com”
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // *** Crucially include the role claim ***
    const payload = {
      id:         user._id.toString(),
      role:       user.role,         // ← must be present
      email:      user.email,
      phone:      user.phone,
      first_name: user.first_name,
      last_name:  user.last_name
    };

    console.log('🔐 Signing JWT with payload:', payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token, message: 'Login successful', role: user.role });
  } catch (err) {
    console.error('loginUser error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
}

// ——————————————————
// 3) Admin: Create Manager
// ——————————————————
async function registerManager(req, res) {
  try {
    const { first_name, last_name, email, password, phone, city } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'first_name, last_name, email and password are required' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hash = await bcrypt.hash(password, 10);
    const manager = new User({
      first_name,
      last_name,
      email,           // case‐sensitive, e.g. “teja@manager.com”
      password: hash,
      phone,
      city,
      role: 'RestaurantManager'
    });
    await manager.save();
    return res.status(201).json({ message: 'RestaurantManager user created' });
  } catch (err) {
    console.error('registerManager error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ———————————————————————————————
// Export all three handlers exactly
// ———————————————————————————————
module.exports = {
  registerUser,
  loginUser,
  registerManager
};
