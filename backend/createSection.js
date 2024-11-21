import mongoose from 'mongoose';
import Section from '../../placeholder/models/sectionModel.js';
import User from '../../placeholder/models/userModel.js';
import Subject from '../../placeholder/models/subjectModel.js';
import Strand from '../../placeholder/models/strandModel.js';
import connectDB from './config/db.js'; // Import your database connection

const createPredefinedSection = async () => {
    try {
        await connectDB(); // Connect to the database

        // Check if the section already exists
        const existingSection = await Section.findOne({ name: 'Grade_11_STEM_A' });
        if (existingSection) {
            console.log('Section "Grade_11_STEM_A" already exists');
            return;
        }

        // Find the required strand
        const strand = await Strand.findOne({ name: 'Test Strand' });
        if (!strand) {
            console.log('Strand not found, please create it first');
            return;
        }

        // Find the predefined subjects
        const mathSubject = await Subject.findOne({ code: 'MATH101' });
        const scienceSubject = await Subject.findOne({ code: 'SCI103' });
        if (!mathSubject || !scienceSubject) {
            console.log('Required subjects not found, please create them first');
            return;
        }

        // Find the teacher
        const teacher = await User.findOne({ username: 'teacher001' });
        if (!teacher) {
            console.log('Teacher not found, please create them first');
            return;
        }

        // Find some students
        const students = await User.find({ role: 'student' }).limit(30);
        if (!students.length) {
            console.log('No students found, please create them first');
            return;
        }

        // Create the section
        const section = new Section({
            name: 'Grade_11_STEM_A',
            teacher: teacher._id,
            students: students.map((student) => student._id),
            subjects: [mathSubject._id, scienceSubject._id],
            strand: strand._id,
        });

        await section.save();
        console.log('Predefined section created with teacher, students, and subjects assigned');
    } catch (error) {
        console.error('Error creating predefined section:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }
    }
};

export { createPredefinedSection };