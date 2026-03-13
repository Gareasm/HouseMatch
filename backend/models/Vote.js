const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
    vote_type: { type: String, enum: ["like", "dislike"], required: true },
    },
  { timestamps: true }
);

voteSchema.index({ user: 1, song: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);