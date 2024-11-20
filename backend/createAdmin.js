import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js';  // Adjust the path according to your project structure
import connectDB from './config/db.js';  // Assuming this is the correct path for your DB connection

// Function to create a predefined admin account
const createPredefinedAdmin = async () => {
    try {
        await connectDB();  // Connect to the database

        // Check if an admin account already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin account already exists.');
            return;
        }

        // Define the admin account details
        const adminData = {
            username: 'admin001',
            password: 'adminpassword',  // You can change this to a more secure password
            role: 'admin',
            profileCompleted: true,  // Admin account will have a completed profile
            isActive: true,
        };

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(adminData.password, salt);

        // Create the admin user
        const adminUser = new User(adminData);

        // Save the admin user to the database
        await adminUser.save();
        console.log('Predefined admin account created successfully!');
        
        mongoose.connection.close();  // Close the DB connection after account creation
    } catch (error) {
        console.error('Error creating admin account:', error);
        mongoose.connection.close();
    }
};

// Run the function to create the admin account
export { createPredefinedAdmin };