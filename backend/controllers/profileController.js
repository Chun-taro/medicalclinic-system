const User = require('../models/User');

// Get profile of logged-in user
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update profile of logged-in user
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    const imagePath = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.userId, { avatar: imagePath });
    res.json({ message: 'Avatar updated', avatar: imagePath });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar
};
