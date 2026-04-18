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

// GET /api/songs/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const songs = await Song.find().sort({ likes: -1, totalVotes: -1, createdAt: -1 });
    res.status(200).json(songs);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Server error fetching leaderboard." });
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
// add a new song with daily submission limit + duplicate SoundCloud check
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

    // normalize URL for duplicate detection
    let normalizedUrl = soundcloudUrl.trim().toLowerCase();
    if (normalizedUrl.endsWith("/")) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    // duplicate check
    const existingSong = await Song.findOne({
      normalizedSoundcloudUrl: normalizedUrl,
    });

    if (existingSong) {
      return res.status(409).json({
        message: "That SoundCloud URL has already been submitted.",
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
      normalizedSoundcloudUrl: normalizedUrl,
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
    if (err.code === 11000) {
      return res.status(409).json({
        message: "That SoundCloud URL has already been submitted.",
      });
    }

    console.error("Error adding song:", err);
    res.status(500).json({ message: "Server error while adding song." });
  }
});

// DELETE /api/songs/:id
// admin only - removes song and all associated votes
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    await Vote.deleteMany({ song: req.params.id });
    await Song.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Song and associated votes deleted." });
  } catch (err) {
    console.error("Error deleting song:", err);
    res.status(500).json({ message: "Server error while deleting song." });
  }
});

// POST /api/songs/:id/vote
// like or dislike a song
router.post("/:id/vote", protect, async (req, res) => {
  try {
    const { vote_type } = req.body; // must match your existing Vote.js
    const songId = req.params.id;
    const userId = req.user.id;

    if (!["like", "dislike"].includes(vote_type)) {
      return res.status(400).json({
        message: "vote_type must be either 'like' or 'dislike'.",
      });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    const existingVote = await Vote.findOne({
      user: userId,
      song: songId,
    });

    if (!existingVote) {
      await Vote.create({
        user: userId,
        song: songId,
        vote_type,
      });
    } else if (existingVote.vote_type === vote_type) {
      // optional toggle-off behavior
      await Vote.findByIdAndDelete(existingVote._id);
    } else {
      existingVote.vote_type = vote_type;
      await existingVote.save();
    }

    const likes = await Vote.countDocuments({
      song: songId,
      vote_type: "like",
    });

    const dislikes = await Vote.countDocuments({
      song: songId,
      vote_type: "dislike",
    });

    const updatedSong = await Song.findByIdAndUpdate(songId,{likes, dislikes, totalVotes: likes + dislikes,},{ new: true });

    res.status(200).json({
      message: "Vote recorded successfully.",
      song: updatedSong,
    });
  } catch (err) {
    console.error("Error recording vote:", err);
    res.status(500).json({ message: "Server error while recording vote." });
  }
});
module.exports = router;