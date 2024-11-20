import mongoose from 'mongoose';
import Subject from './models/subjectModel.js';  // Assuming the Subject model is in 'models/subjectModel.js'
import Semester from './models/semesterModel.js'; // Assuming you have a Semester model
import User from './models/userModel.js'; // Assuming your teachers are stored in the 'User' model



// Function to create predefined subjects
const createPredefinedSubjects = async () => {
    try {
        // Fetch the predefined semester
        const semester = await Semester.findOne({ name: 'Semester 1' }); // Replace with your actual semester name
        if (!semester) {
            console.error('Semester not found!');
            return;
        }

        // Fetch the existing teachers from the User collection
        const teachers = await User.find({ role: 'teacher' }).select('_id'); // Fetching only the _id of teachers

        if (teachers.length === 0) {
            console.error('No teachers found!');
            return;
        }

        // Predefined subjects
        const predefinedSubjects = [
            { 
                name: 'Mathematics', 
                code: 'MATH101', 
                semester: semester._id, // Using the fetched semester ObjectId
                teachers: teachers.map(teacher => teacher._id),  // Assigning all teachers to the subject
            },
            { 
                name: 'English', 
                code: 'ENG102', 
                semester: semester._id, // Using the fetched semester ObjectId
                teachers: teachers.map(teacher => teacher._id),  // Assigning all teachers to the subject
            },
            { 
                name: 'Science', 
                code: 'SCI103', 
                semester: semester._id, // Using the fetched semester ObjectId
                teachers: teachers.map(teacher => teacher._id),  // Assigning all teachers to the subject
            },
            { 
                name: 'History', 
                code: 'HIST104', 
                semester: semester._id, // Using the fetched semester ObjectId
                teachers: teachers.map(teacher => teacher._id),  // Assigning all teachers to the subject
            },
            { 
                name: 'Filipino', 
                code: 'FIL105', 
                semester: semester._id, // Using the fetched semester ObjectId
                teachers: teachers.map(teacher => teacher._id),  // Assigning all teachers to the subject
            }
        ];

        // Insert predefined subjects into the database
        for (const subject of predefinedSubjects) {
            const newSubject = new Subject(subject);
            await newSubject.save();
            console.log(`Subject ${subject.name} created successfully.`);
        }

        mongoose.connection.close(); // Close the MongoDB connection after insertion
    } catch (error) {
        console.error('Error creating predefined subjects:', error);
        mongoose.connection.close();
    }
};

// Run the function to create predefined subjects
export { createPredefinedSubjects };