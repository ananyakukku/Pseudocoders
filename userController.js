const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('questions', 'title votes createdAt')
      .populate('answers', 'body votes isAccepted createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, profilePicture },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};