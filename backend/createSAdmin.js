import mongoose from 'mongoose';
import User from './models/userModel.js';
import connectDB from './config/db.js';

// Create a predefined superadmin without hashing the password initially
const createPredefinedSuperAdmin = async () => {
    try {
        await connectDB(); // Connect to the database

        const superadminUsername = 'superadmin'; // Set a predefined username
        const superadminPassword = 'SAdmin54321'; // Set a predefined password

        const existingSuperAdmin = await User.findOne({ username: superadminUsername });

        if (existingSuperAdmin) {
            console.log('Superadmin account already exists.');
        } else {
            // Create a new user instance without hashing the password here
            const superAdmin = new User({
                username: superadminUsername,
                password: superadminPassword, // Use plain password initially
                role: 'superadmin',
            });

            await superAdmin.save(); // The pre-save hook will hash the password
            console.log('Predefined superadmin account created successfully.');
        }

        mongoose.connection.close(); // Close the database connection
    } catch (error) {
        console.error('Error creating superadmin:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

export { createPredefinedSuperAdmin };