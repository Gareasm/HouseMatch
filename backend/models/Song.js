const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    soundcloudUrl: { type: String, required: true, trim: true },
    normalizedSoundcloudUrl: {type: String, required: true, unique: true, index: true},
    submittedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true},
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

songSchema.pre("validate", function (next) {
  if (this.soundcloudUrl) {
    let url = this.soundcloudUrl.trim().toLowerCase();

    // remove trailing slash
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    this.normalizedSoundcloudUrl = url;
  }
  next();
});

module.exports = mongoose.model("Song", songSchema);
