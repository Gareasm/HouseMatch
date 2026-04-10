const express = require("express");
const router = express.Router();
const Song = require("../models/Song");
const Vote = require("../models/Vote");
const { protect, admin } = require("../middleware/authMiddleware");

//GET /api/songs
//fetch all songs for the feed
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.status(200).json(songs);
  } catch (err) {
    console.error("Error fetching songs:", err);
    res.status(500).json({ message: "Server error fetching songs." });
  }
});

//GET /api/songs/recommendations
router.get("/recommendations", protect, async (req, res) => {
  try {
    const userVotes = await Vote.find({ user: req.user.id });
    const seenSongIds = userVotes.map((vote) => vote.song);

    const recommendations = (
      await Song.find({ _id: { $nin: seenSongIds } })
    ).sort({ likes: -1 });

    if (recommendations.length === 0) {
      return res
        .status(200)
        .json({ message: "No more songs to rank, come back later!" });
    }

    res.status(200).json(recommendations);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ message: "Server error fetching recommendations." });
  }
});

//GET /api/songs/:id
//fetch one song by ID
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    res.status(200).json(song);
  } catch (err) {
    console.error("Error fetching song:", err);

    //invalid ObjectId or other query issue
    return res.status(400).json({ message: "Invalid song ID." });
  }
});

// POST /api/songs
// add a new song with daily submission limit
router.post("/", protect, async (req, res) => {
  try {
    const { title, artist, soundcloudUrl } = req.body;

    if (!title || !artist || !soundcloudUrl) {
      return res.status(400).json({
        message: "Title, artist, and SoundCloud URL are required.",
      });
    }

    const soundcloudRegex =
      /^https?:\/\/(www\.)?(soundcloud\.com|on\.soundcloud\.com)\/.*$/i;

    if (!soundcloudRegex.test(soundcloudUrl)) {
      return res.status(400).json({
        message: "Invalid SoundCloud URL. Try again.",
      });
    }

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);

    const submissionsToday = await Song.countDocuments({
      submittedBy: req.user.id,
      createdAt: { $gte: midnight },
    });

    if (submissionsToday >= 5) {
      return res.status(429).json({
        message:
          "Daily submission limit reached. You can submit up to 5 songs per day.",
      });
    }

    const newSong = await Song.create({
      title,
      artist,
      soundcloudUrl,
      submittedBy: req.user.id,
      likes: 0,
      dislikes: 0,
      totalVotes: 0,
    });

    res.status(201).json({
      message: "Song added successfully!",
      song: newSong,
      submissionsRemaining: 4 - submissionsToday,
    });
  } catch (err) {
    console.error("Error adding song:", err);
    res.status(500).json({ message: "Server error while adding song." });
  }
});

module.exports = router;