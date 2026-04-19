const express = require("express");
const router = express.Router();
const Song = require("../models/Song");
const Vote = require("../models/Vote");
const { protect, admin } = require("../middleware/authMiddleware");
const { resolveTrack } = require("../utils/soundcloud");

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
// Returns songs recommended based on user's liked songs (content-based filtering)
// Scoring: Artist match (+50), Genre match (+30), BPM match (+20)
router.get("/recommendations", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all songs user has voted on
    const userVotes = await Vote.find({ user: userId }).populate('song');
    
    // Filter out votes where song is null (deleted songs)
    const validVotes = userVotes.filter(vote => vote.song !== null);
    const seenSongIds = validVotes.map((vote) => vote.song._id);

    // Get liked songs only
    const likedVotes = validVotes.filter(vote => vote.vote_type === 'like');
    
    // If user is new (no likes), return top songs by votes
    if (likedVotes.length === 0) {
      const topSongs = await Song.find({ _id: { $nin: seenSongIds } })
        .sort({ likes: -1, totalVotes: -1 })
        .limit(50);
      
      if (topSongs.length === 0) {
        return res.status(200).json({ 
          message: "No more songs to rank, come back later!" 
        });
      }

      return res.status(200).json(topSongs);
    }

    // Extract user preferences from liked songs
    const likedSongs = likedVotes.map(v => v.song);
    const preferredArtists = [...new Set(likedSongs.map(s => s.artist).filter(a => a))];
    const preferredGenres = [...new Set(likedSongs.map(s => s.genre).filter(g => g))];
    
    // Calculate average BPM from liked songs with BPM data
    const songsWithBpm = likedSongs.filter(s => s.bpm !== null && s.bpm !== undefined);
    const avgBpm = songsWithBpm.length > 0 
      ? songsWithBpm.reduce((sum, s) => sum + s.bpm, 0) / songsWithBpm.length 
      : null;

    // Find unseen candidate songs
    const candidates = await Song.find({ _id: { $nin: seenSongIds } });

    // Score each candidate based on similarity
    const scoredSongs = candidates.map(song => {
      let score = 0;

      // Artist match: +50 points (highest priority)
      if (song.artist && preferredArtists.includes(song.artist)) {
        score += 50;
      }

      // Genre match: +30 points
      if (song.genre && preferredGenres.includes(song.genre)) {
        score += 30;
      }

      // BPM similarity: +20 points (within ±10 BPM range)
      if (avgBpm !== null && song.bpm !== null && song.bpm !== undefined && Math.abs(song.bpm - avgBpm) <= 10) {
        score += 20;
      }

      // Popularity tiebreaker: boost by vote ratio (0-10 points)
      const totalVotes = song.totalVotes || 0;
      const likes = song.likes || 0;
      if (totalVotes > 0) {
        const voteRatio = (likes / totalVotes) * 100;
        score += Math.min(voteRatio / 10, 10);
      }

      return { ...song.toObject(), recommendationScore: score };
    });

    // Sort by recommendation score descending and return top 50
    const recommendations = scoredSongs
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 50);

    if (recommendations.length === 0) {
      return res.status(200).json({ 
        message: "No more songs to rank, come back later!" 
      });
    }

    res.status(200).json(recommendations);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ message: "Server error fetching recommendations." });
  }
});

// GET /api/songs/leaderboard
// Returns songs sorted by vote ratio (highest to lowest)
// voteRatio = (likes / totalVotes) * 100, or 0 if no votes
router.get("/leaderboard", async (req, res) => {
  try {
    const songs = await Song.find();
    
    // Calculate vote ratio for each song
    const songsWithRatio = songs.map(song => {
      const songObj = song.toObject();
      const voteRatio = song.totalVotes > 0 
        ? (song.likes / song.totalVotes) * 100 
        : 0;
      return {
        ...songObj,
        voteRatio: Math.round(voteRatio * 100) / 100 // Round to 2 decimal places
      };
    });

    // Sort by vote ratio descending (highest first)
    songsWithRatio.sort((a, b) => b.voteRatio - a.voteRatio);

    res.status(200).json(songsWithRatio);
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

    let soundcloudMeta = {
      soundcloudTrackId: null,
      artworkUrl: null,
      permalinkUrl: soundcloudUrl,
      previewUrl: null,
      streamAccess: null,
      genre: null,
    };

    try {
      soundcloudMeta = await resolveTrack(soundcloudUrl);
    } catch (err) {
      console.error("SoundCloud enrichment failed:", err.message);
    }

    const newSong = await Song.create({
      title,
      artist,
      soundcloudUrl,
      normalizedSoundcloudUrl: normalizedUrl,
      submittedBy: req.user.id,
      soundcloudTrackId: soundcloudMeta.soundcloudTrackId,
      artworkUrl: soundcloudMeta.artworkUrl,
      permalinkUrl: soundcloudMeta.permalinkUrl,
      previewUrl: soundcloudMeta.previewUrl,
      streamAccess: soundcloudMeta.streamAccess,
      genre: soundcloudMeta.genre,
      bpm: soundcloudMeta.bpm || null,
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