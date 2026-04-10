const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    soundcloudUrl: { type: String, required: true, trim: true },
    submittedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true},
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);
