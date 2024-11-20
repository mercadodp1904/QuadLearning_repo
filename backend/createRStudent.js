import mongoose from 'mongoose';
import Student from './models/studentModel.js'; // Adjust the path to your actual Student model
import User from './models/userModel.js'; // Adjust the path to your actual User model
import Section from './models/sectionModel.js'; // Adjust the path to your actual Section model
import Strand from './models/strandModel.js'; // Adjust the path to your actual Strand model
import Subject from './models/subjectModel.js'; // Adjust the path to your Subject model
const createPredefinedRStudent = async () => {
    try {
        // Fetch the user by username and populate associated fields
        const user = await User.findOne({ username: 'student123' })
            .populate('section')  // Populates the section field
            .populate('strand')   // Populates the strand field
            .populate('subjects'); // Populates the subjects field

        if (!user) {
            throw new Error('User not found.');
        }

        // Extract section, strand, and subjects from the populated user
        const section = user.section;
        const strand = user.strand;
        const subjects = user.subjects;

        // Ensure the section and strand exist before creating the student
        if (!section || !strand) {
            throw new Error('Section or Strand not found for the user.');
        }
        // Predefined student data
        const studentData = {
            user: user._id,
            profileCompleted: false,
            lrn: '123456789012',
            name: 'John Doe',
            gender: 'Male',
            birthdate: new Date('2007-01-15'),
            birthplace: {
                province: 'Sorsogon',
                municipality: 'Sorsogon City',
                barrio: 'Barangay Demo',
            },
            address: '123 Demo Street, Barangay Demo, Sorsogon City',
            guardian: {
                name: 'Jane Doe',
                occupation: 'Teacher',
            },
            yearLevel: '12',
            section: section._id,
            strand: strand._id,
            school: {
                name: 'Tropical Village National High School',
                year: '2024',
            },
            attendance: {
                totalYears: 2,
            },
            grades: [
                {
                    semester: '1st',
                    year: '2024',
                    subjects: subjects.map((subject) => ({
                        name: subject.name,
                        midterm: 85,
                        finals: 90,
                        finalRating: 87.5,
                        action: 'PASSED',
                    })),
                },
            ],
            contactNumber: '09123456789',
        };

        // Create the student
        const student = await Student.create(studentData);

        console.log('Predefined student created:', student);
    } catch (error) {
        console.error('Error creating predefined student:', error);
    } finally {
        mongoose.connection.close();
    }
};

export { createPredefinedRStudent };