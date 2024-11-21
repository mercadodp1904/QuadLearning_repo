import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model for the student
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model for the teacher
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Subject model
        required: true,
        ref: 'Subject',
    },
    grade: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    semester: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a Semester model, if you implement it
        ref: 'Semester', // Uncomment this if you use a Semester model
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section', // Reference to the Section model
    },
    finalGrade: { // Optional: to store final computed grade
        type: Number,
    },
    schoolYear: { // Optional: to specify the academic year
        type: String,
        required: true,
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;