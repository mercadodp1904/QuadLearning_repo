import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Link to User model
        required: true,
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',  // Link to Subject model
        required: false,  // Optional, can be empty initially
    }],
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',  // Link to Section model
        required: false,  // Optional, can be empty initially
    }],
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;