import mongoose from 'mongoose';
import Section from './models/sectionModel.js';
import User from './models/userModel.js';
import Subject from './models/subjectModel.js';
import Strand from './models/strandModel.js';
import connectDB from './config/db.js'; // Import your database connection

// Function to create a predefined section
const createPredefinedSection = async () => {
    try {
        await connectDB(); // Connect to the database

        // Find the required strand (e.g., Test Strand)
        const strand = await Strand.findOne({ name: 'Test Strand' });
        if (!strand) {
            console.log('Strand not found, please create it first');
            return;
        }

        // Find the predefined subjects (ensure they exist)
        const mathSubject = await Subject.findOne({ code: 'MATH101' });
        const scienceSubject = await Subject.findOne({ code: 'SCI103' });

        if (!mathSubject || !scienceSubject) {
            console.log('Required subjects not found, please create them first');
            return;
        }

        // Find the teacher (ensure they exist)
        const teacher = await User.findOne({ username: 'teacher001' });
        if (!teacher) {
            console.log('Teacher not found, please create them first');
            return;
        }

        // Find some students (ensure they exist)
        const students = await User.find({ role: 'student' }).limit(30); // Example: find 30 students
        if (!students.length) {
            console.log('No students found, please create them first');
            return;
        }

        // Create the predefined section
        const section = new Section({
            name: 'Grade 11 STEM A', // Section name
            teacher: teacher._id, // Assign teacher by ID
            students: students.map(student => student._id), // Assign students by IDs
            subjects: [mathSubject._id, scienceSubject._id], // Assign subjects by IDs
            strand: strand._id, // Assign strand by ID
        });

        await section.save(); // Save the section to the database
        console.log('Predefined section created with teacher, students, and subjects assigned');

        mongoose.connection.close(); // Close the database connection
    } catch (error) {
        console.error('Error creating predefined section:', error);
        mongoose.connection.close(); // Close the connection in case of error
    }
};

export { createPredefinedSection };