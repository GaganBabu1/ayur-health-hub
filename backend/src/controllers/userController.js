const User = require('../models/User');
const HealthHistory = require('../models/HealthHistory');
const bcrypt = require('bcryptjs');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { age, gender, height, weight, lifestyle, sleepQuality, chronicConditions, allergies, diseaseHistory } = req.body;

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      {
        age,
        gender,
        height,
        weight,
        lifestyle,
        sleepQuality,
        chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : [chronicConditions].filter(Boolean),
        allergies: Array.isArray(allergies) ? allergies : [allergies].filter(Boolean),
        diseaseHistory,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get health history (currently returns user's profile data)
const getHealthHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all health history records for this user, sorted by date
    const healthRecords = await HealthHistory.find({ userId })
      .sort({ date: -1 })
      .lean();

    res.status(200).json(healthRecords);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a health history entry
const addHealthEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weight, activityLevel, sleepQuality, notes, chronicConditions, date } = req.body;

    // Create new health history record
    const healthEntry = new HealthHistory({
      userId,
      date: date ? new Date(date) : new Date(),
      weight,
      activityLevel,
      sleepQuality,
      notes,
      chronicConditions: chronicConditions || [],
    });

    const savedEntry = await healthEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailNotifications, appointmentReminders, healthTips, dataSharing } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        preferences: {
          emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
          appointmentReminders: appointmentReminders !== undefined ? appointmentReminders : true,
          healthTips: healthTips !== undefined ? healthTips : true,
          dataSharing: dataSharing !== undefined ? dataSharing : false,
        },
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: user.preferences || {
        emailNotifications: true,
        appointmentReminders: true,
        healthTips: true,
        dataSharing: false,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getHealthHistory,
  addHealthEntry,
  changePassword,
  updatePreferences,
  deleteAccount,
};
