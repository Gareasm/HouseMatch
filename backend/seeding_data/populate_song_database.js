const Song = require('../models/Song');
const Song_Data = require('./songs_data.json');

const seedDatabase = async () => {
    try {
        // Clear existing data
        await Song.deleteMany({});
        console.log('Existing songs cleared');

        // Insert new song data
        await Song.insertMany(Song_Data);
        console.log('Successfully seeded database with song data');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

module.exports = populate_song_database;