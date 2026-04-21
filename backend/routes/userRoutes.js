//Imports
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vote = require('../models/Vote');
const { protect, admin } = require('../middleware/authMiddleware');

//Get all users (admin only)
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    }
    catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error fetching users." });
    }
});

// Get vote stats for the logged in user this is for the profile page
router.get('/users/me/stats', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const Song = require('../models/Song');
        const [liked, disliked, submitted] = await Promise.all([
            Vote.countDocuments({ user: userId, vote_type: 'like' }),
            Vote.countDocuments({ user: userId, vote_type: 'dislike' }),
            Song.countDocuments({ submittedBy: userId }),
        ]);
        res.status(200).json({ liked, disliked, submitted });
    }
    catch (err) {
        console.error("Error fetching user stats:", err);
        res.status(500).json({ message: "Server error fetching stats." });
    }
});

// Get liked songs for the user
router.get('/users/me/liked-songs', protect, async (req, res) => {
    try {
        const votes = await Vote.find({ user: req.user.id, vote_type: 'like' })
            .populate('song', 'title artist artworkUrl soundcloudUrl permalinkUrl')
            .sort({ createdAt: -1 });
        const songs = votes.map(v => v.song).filter(Boolean);
        res.status(200).json(songs);
    }
    catch (err) {
        console.error("Error fetching liked songs:", err);
        res.status(500).json({ message: "Server error fetching liked songs." });
    }
});

module.exports = router;