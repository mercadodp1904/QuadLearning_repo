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
        type: String,
        required: true,
    },
    grade: {
        type: Number,
        required: true, 
    },
    year: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;