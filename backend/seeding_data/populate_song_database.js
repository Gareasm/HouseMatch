const Song = require('../models/Song');
const songData = require('./songs_data.json');
const { resolveTrack } = require('../utils/soundcloud');
const User = require('../models/User');

const populate_song_database = async () => {
	try {
		await Song.deleteMany();
		console.log('Existing songs cleared');

		const users = await User.find();

		const enrichedSongs = [];

		for (const song of songData) {
			let meta = {
				soundcloudTrackId: null,
				artworkUrl: null,
				permalinkUrl: song.soundcloudUrl,
				previewUrl: null,
				streamAccess: null,
			};

			try {
				meta = await resolveTrack(song.soundcloudUrl);
				console.log('Resolved:', song.title);
			} catch (err) {
				console.error("FAILED:", song.title);
                console.error(err.response?.data || err.message || err);
			}

			enrichedSongs.push({
				title: song.title,
				artist: song.artist,
				soundcloudUrl: song.soundcloudUrl,
				normalizedSoundcloudUrl: song.soundcloudUrl.trim().toLowerCase().replace(/\/$/, ''),
				submittedBy: users[0]._id,

				soundcloudTrackId: meta.soundcloudTrackId,
				artworkUrl: meta.artworkUrl,
				permalinkUrl: meta.permalinkUrl,
				previewUrl: meta.previewUrl,
				streamAccess: meta.streamAccess,

				likes: 0,
				dislikes: 0,
				totalVotes: 0,
			});
		}

		await Song.insertMany(enrichedSongs);

		console.log('Songs seeded with SoundCloud data');
	} catch (err) {
		console.error('Error seeding songs:', err);
	}
};

module.exports = populate_song_database;