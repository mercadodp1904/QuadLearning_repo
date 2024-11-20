import mongoose from 'mongoose';
import Semester from './models/semesterModel.js'; // Adjust the path as needed
import connectDB from './config/db.js'; // Import your DB connection logic

const createPredefinedSemester = async () => {
    try {
        await connectDB(); // Connect to the database

        // Define predefined semesters
        const predefinedSemesters = ['Semester 1', 'Semester 2', 'Summer Term']; // Add more semesters as needed

        for (let semesterName of predefinedSemesters) {
            // Check if the semester already exists
            const existingSemester = await Semester.findOne({ name: semesterName });

            if (existingSemester) {
                console.log(`Semester "${semesterName}" already exists.`);
            } else {
                // Create a new semester document
                const newSemester = new Semester({
                    name: semesterName,
                });

                // Save the new semester to the database
                await newSemester.save();
                console.log(`Predefined semester "${semesterName}" created successfully.`);
            }
        }

        mongoose.connection.close(); // Close the database connection after the process
    } catch (error) {
        console.error('Error creating predefined semesters:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

// Run the function to create predefined semesters
export { createPredefinedSemester };