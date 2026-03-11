const fs = require('fs');
const {faker} = require('@faker-js/faker');

const generateUsers = (numUsers) => {
    const users = [];

    users.push({
        username: "superadmin",
        email: "superadmin@housematch.com",
        password: "password",
        role: "admin",
    });

    for (let i = 0; i < numUsers - 1; i++) {
        //Assign Roles
        const assigned_role = Math.random() < 0.1 ? 'admin' : 'member';
        users.push({
            username: faker.internet.username(),
            email: faker.internet.email().toLowerCase(),
            password: "password",
            role: assigned_role,
        });
    }

    return users;
};

const numUsersToGenerate = 50;

fs.writeFileSync('./seeding_data/users_data.json', JSON.stringify(generateUsers(numUsersToGenerate), null, 2));

console.log(`Generated users and saved to users.json`);