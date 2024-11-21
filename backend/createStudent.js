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
        password: 'password123',
        name: 'Juan Dela Cruz',
        role: 'student',
        age: 18,
        gender: 'Male',
        profileCompleted: true,
        isActive: true,
        section: 'Grade_11_STEM_A',
        strand: 'STEM',
        subjects: ['Mathematics', 'Science'],
        semester: 'Semester 1',
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
        section: 'Grade_11_STEM_A',
        strand: 'STEM',
        subjects: ['English', 'History'],
        semester: 'Semester 2',
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
        section: 'Grade_11_STEM_A',
        strand: 'STEM',
        subjects: ['Mathematics', 'English'],
        semester: 'Summer Term',
    },
];

// Function to create predefined students
const createPredefinedStudents = async () => {
    try {
        await connectDB(); // Connect to the database

        for (let student of predefinedStudents) {
            console.log('Processing student:', student);

            // Fetch the IDs of related documents (section)
            const sections = await Section.find({ name: student.section }).collation({ locale: 'en', strength: 2 });
            if (!sections.length) {
                console.error(`Section "${student.section}" not found. Skipping student "${student.name}".`);
                continue;
            }
            console.log(`Sections found: ${sections.map(section => section.name).join(', ')}`);

            const strand = await Strand.findOne({ name: student.strand }).select('_id');
            if (!strand) {
                console.log(`Strand "${student.strand}" not found. Skipping student ${student.name}.`);
                continue;
            }

            const subjects = await Subject.find({ name: { $in: student.subjects } }).select('_id');
            if (subjects.length !== student.subjects.length) {
                console.log(
                    `Some subjects not found for student ${student.name}. Available subjects: ${subjects.map(
                        (sub) => sub._id
                    )}`
                );
            }

            const semester = await Semester.findOne({ name: student.semester }).select('_id');
            if (!semester) {
                console.log(`Semester "${student.semester}" not found. Skipping student "${student.name}".`);
                continue;
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            student.password = await bcrypt.hash(student.password, salt);

            // Create the student object
            const studentData = {
                username: student.username,
                password: student.password,
                name: student.name,
                role: student.role,
                age: student.age,
                gender: student.gender,
                profileCompleted: student.profileCompleted,
                isActive: student.isActive,
                sections: sections.map((section) => section._id), // Store sections as an array of ObjectIds
                strand: strand._id,
                subjects: subjects.map((subject) => subject._id),
                semester: semester._id,
            };

            // Save the student to the database
            const createdStudent = await User.create(studentData);
            console.log(`Student "${createdStudent.name}" created successfully.`);
        }

        mongoose.connection.close(); // Close the database connection
    } catch (error) {
        console.error('Error creating predefined students:', error);
        mongoose.connection.close(); // Close the connection in case of error
    }
};

export { createPredefinedStudents };