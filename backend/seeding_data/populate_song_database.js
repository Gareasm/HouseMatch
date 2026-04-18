const Song = require('../models/Song');
const User = require('../models/User');
const Song_Data = require('./songs_data.json');

const seedDatabase = async () => {
    try {
        // Clear existing data
        await Song.deleteMany({});
        console.log('Existing songs cleared');

        const defaultUser = await User.findOne();
        if (!defaultUser) {
            throw new Error('No users found. Seed users before songs.');
        }

        const songsWithSubmittedBy = Song_Data.map((song) => ({
            ...song,
            submittedBy: defaultUser._id,
        }));

        // Insert new song data
        await Song.insertMany(songsWithSubmittedBy);
        console.log('Successfully seeded database with song data');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

module.exports = seedDatabase;