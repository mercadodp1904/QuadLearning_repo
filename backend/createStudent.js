import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js'; // Assuming this is the correct path for your User model
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js'; // Import connectDB
import Strand from './models/strandModel.js'; // Import the Strand model

// Predefined student data
const predefinedStudents = [
    {
        username: 'student001',
        password: 'password123', // In a real app, this should be hashed
        name: 'Juan Dela Cruz',
        role: 'student',
        age: 18,
        gender: 'Male',
        section: null, // Add section reference if needed
        profileCompleted: true,
        isActive: true
    },
    {
        username: 'student002',
        password: 'password456',
        name: 'Maria Clara',
        role: 'student',
        age: 17,
        gender: 'Female',
        birthdate: '2007-06-24',
        section: null, // Add section reference if needed
        profileCompleted: true,
        isActive: true
    },
    {
        username: 'student003',
        password: 'password789',
        name: 'Carlos Garcia',
        role: 'student',
        age: 19,
        gender: 'Male',
        birthdate: '2005-11-30',
        section: null, // Add section reference if needed
        profileCompleted: true,
        isActive: true
    },
    // Add more students here as needed
];

// Function to create predefined students
const createPredefinedStudents = async () => {
    try {
        await connectDB(); // Connect to the database

        // Find the required strand (e.g., 'Test Strand')
        const strand = await Strand.findOne({ name: 'Test Strand' });

        if (!strand) {
            console.log('Strand not found, please create it first');
            mongoose.connection.close();
            return;
        }

        for (let student of predefinedStudents) {
            // Assign the strand reference
            student.strand = strand._id; // Set the strand field to the _id of the found strand

            // Hash the password before saving to the database
            const salt = await bcrypt.genSalt(10);
            student.password = await bcrypt.hash(student.password, salt);

            // Create the student record in the database
            const createdStudent = await User.create(student);
            console.log(`Student ${createdStudent.name} created successfully`);
        }

        mongoose.connection.close(); // Close the database connection after creating students
    } catch (error) {
        console.error('Error creating students:', error);
        mongoose.connection.close();
    }
};

export { createPredefinedStudents };