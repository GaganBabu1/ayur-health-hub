const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight, lifestyle, sleepQuality, diseaseHistory } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user (role always defaults to "patient")
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      age,
      gender,
      height,
      weight,
      lifestyle,
      sleepQuality,
      diseaseHistory,
      role: 'patient',
    });

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token (wrapped in 'user' field for frontend compatibility)
    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        lifestyle: user.lifestyle,
        sleepQuality: user.sleepQuality,
        diseaseHistory: user.diseaseHistory,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token (wrapped in 'user' field for frontend compatibility)
    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        lifestyle: user.lifestyle,
        sleepQuality: user.sleepQuality,
        diseaseHistory: user.diseaseHistory,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Initialize First Admin (for bootstrap - only works if no admins exist)
const initializeAdmin = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role || !['admin', 'doctor'].includes(role)) {
      return res.status(400).json({ error: 'userId and valid role (admin/doctor) are required' });
    }

    // Check if any admins already exist (security: prevent unauthorized admin creation)
    // NOTE: Allow doctor creation; only restrict admin creation if different admin exists
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      console.log('[initializeAdmin] userId:', userId);
      console.log('[initializeAdmin] adminExists:', adminExists ? { id: adminExists._id, email: adminExists.email } : null);
      // Only block if a different admin exists
      if (adminExists && adminExists._id && adminExists._id.toString() !== userId) {
        return res.status(403).json({ error: 'Admin already exists' });
      }
    }

    // Update user role
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: `User promoted to ${role}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser, initializeAdmin };
