const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    soundcloudUrl: { type: String, required: true, trim: true },
    normalizedSoundcloudUrl: {type: String, required: true, unique: true, index: true},
    submittedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true},
    soundcloudTrackId: { type: Number, default: null, index: true },
		artworkUrl: { type: String, default: null },
		permalinkUrl: { type: String, default: null },
		previewUrl: { type: String, default: null },
		streamAccess: {
			type: String,
			enum: ["playable", "preview", "blocked"],
      default: null,
			default: null,
		},    genre: { type: String, default: null, index: true },
    bpm: { type: Number, default: null, index: true },    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

songSchema.pre("validate", function () {
  if (this.soundcloudUrl) {
    let url = this.soundcloudUrl.trim().toLowerCase();

    // remove trailing slash
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    this.normalizedSoundcloudUrl = url;
  }
});

module.exports = mongoose.model("Song", songSchema);
