require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./config/db');
const populate_user_database = require('./seeding_data/populate_user_database');
const populate_song_database = require('./seeding_data/populate_song_database');

const run_seeder = async () => {
    try {
        await db();
        console.log('Starting Seeding Process...');

        await populate_user_database();
        await populate_song_database();

        console.log('Seeding Process Completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding process:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

run_seeder();