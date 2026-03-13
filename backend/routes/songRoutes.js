const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const Vote = require('../models/Vote');
const { protect } = require('../middleware/authMiddleware');

router.get('/recommendations', protect, async (req, res) => {
    //Get songs for recommendations
    try {
        const userVotes = await Vote.find({ user: req.user._id });
        const seenSongIds = userVotes.map(vote => vote.song);
        const recommendations = (await Song.find({ _id: { $nin: seenSongIds } })).sort({ likes: -1});

        // If no more songs to recommend, return a message
        if (recommendations.length === 0) {
            return res.status(200).json({ message: "No more songs to rank, come back later!" });
        }
        res.status(200).json(recommendations);
    }
    catch (err) {
        console.error("Error fetching recommendations:", err);
        res.status(500).json({ message: "Server error fetching recommendations." });
    }
});

//Validate Soundcloud Url and upload to db
router.post('/add', protect, async (req, res) => {
    try {
        const { title, artist, url } = req.body;
        const soundcloudRegex = /^https?:\/\/(www\.)?(soundcloud\.com|on\.soundcloud\.com)\/.*$/i;

        if (!soundcloudRegex.test(url)) {
            return res.status(400).json({ message: "Invalid SoundCloud URL. Try again." });
        }

        const newSong = await Song.create({
            title: title,
            artist: artist,
            url: url,
            likes: 0,
            dislikes: 0,
            totalVotes: 0
        });

        res.status(201).json({ message: "Song added successfully!", song: newSong });
    }
    catch (err) {
        console.error("Error adding song:", err);
        res.status(500).json({ message: "Server error while adding song." });
    }
});

module.exports = router;