const User = require('../models/User');
const User_Data = require('./users_data.json');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        console.log('Existing users cleared');

        //Hash Paswords Securely Before Inserting
        const users_with_hashed_passwords = await Promise.all(User_Data.map(async (user) => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            return { 
                username: user.username,
                email: user.email,
                role: user.role,
                password: hashedPassword
            };
        }));

        // Insert new user data
        await User.insertMany(users_with_hashed_passwords);
        console.log('Successfully seeded database with user data');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

module.exports = seedDatabase;