const User = require('../models/User');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const { role } = req.body;
    const validRoles = ['patient', 'admin', 'doctor', 'nurse'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Role updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get role by Google ID
const getRoleByGoogleId = async (req, res) => {
  try {
    const { googleId } = req.params;
    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ role: user.role });
  } catch (err) {
    console.error('Error fetching role by Google ID:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  getRoleByGoogleId
};
