import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js'; // Assuming this is the correct path for your User model
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js'; // Import connectDB
import Strand from './models/strandModel.js'; // Import the Strand model
import Section from './models/sectionModel.js'; // Import the Section model
import Subject from './models/subjectModel.js'; // Import the Subject model
import Semester from './models/semesterModel.js'; // Import the Semester model

// Predefined student data
const predefinedStudents = [
    {
        username: 'student001',
        password: 'password123', // In a real app, this should be hashed
        name: 'Juan Dela Cruz',
        role: 'student',
        age: 18,
        gender: 'Male',
        profileCompleted: true,
        isActive: true,
        section: 'Grade 11 STEM A', // Reference to section
        strand: 'STEM', // Add strand name
        subjects: ['Mathematics', 'Science'], // List of subjects
        semester: 'Semester 1', // Add semester name
    },
    {
        username: 'student002',
        password: 'password456',
        name: 'Maria Clara',
        role: 'student',
        age: 17,
        gender: 'Female',
        birthdate: '2007-06-24',
        profileCompleted: true,
        isActive: true,
        section: 'Grade 11 STEM A', // Reference to section
        strand: 'STEM', // Add strand name
        subjects: ['English', 'History'],
        semester: 'Semester 2', // Add semester name
    },
    {
        username: 'student003',
        password: 'password789',
        name: 'Carlos Garcia',
        role: 'student',
        age: 19,
        gender: 'Male',
        birthdate: '2005-11-30',
        profileCompleted: true,
        isActive: true,
        section: 'Grade 11 STEM A', // Reference to section
        strand: 'STEM', // Add strand name
        subjects: ['Mathematics', 'English'],
        semester: 'Summer Term', // Add semester name
    },
    // Add more students here as needed
];


// Function to create predefined students
const createPredefinedStudents = async () => {
    try {
        await connectDB(); // Connect to the database

        // Loop through predefined students
        for (let student of predefinedStudents) {
            console.log('Creating student:', student); // Log to check student data

            if (!student.name || !student.username) {
                console.log('Student data is incomplete:', student);
                continue; // Skip creating this student if data is incomplete
            }

            // Find the section by name
            const section = await Section.findOne({ name: student.section });
            if (section) {
                student.section = section._id; // Set the section field to the _id of the found section
            } else {
                console.log(`Section ${student.section} not found for student ${student.name}`);
                continue; // Skip creating this student if the section is not found
            }

            // Find the strand by name
            const strand = await Strand.findOne({ name: student.strand });
            if (strand) {
                student.strand = strand._id; // Set the strand field to the _id of the found strand
            } else {
                console.log(`Strand ${student.strand} not found for student ${student.name}`);
                continue; // Skip creating this student if the strand is not found
            }

            // Assign subjects references based on subject names
            const subjectIds = [];
            for (let subjectName of student.subjects) {
                const subject = await Subject.findOne({ name: subjectName });
                if (subject) {
                    subjectIds.push(subject._id); // Push the subject _id to the array
                } else {
                    console.log(`Subject ${subjectName} not found for student ${student.name}`);
                }
            }
            student.subjects = subjectIds; // Set the subjects field to the list of subject _ids

            // Assign the semester reference based on the semester name
            const semester = await Semester.findOne({ name: student.semester });
            if (semester) {
                student.semester = semester._id; // Set the semester field to the _id of the found semester
            } else {
                console.log(`Semester ${student.semester} not found for student ${student.name}`);
                continue; // Skip creating this student if the semester is not found
            }

            // Hash the password before saving to the database
            const salt = await bcrypt.genSalt(10);
            student.password = await bcrypt.hash(student.password, salt);

            // Final check before creating the student
            console.log('Final student object before creation:', student);

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