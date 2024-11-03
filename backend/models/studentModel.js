import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    },
    name: String,
    age: Number,
    gender: String,
    yearLevel: String,
    birthdate: Date,
    address: String,
    contactNumber: String,
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
    },
    strand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strand',
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
    }],
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;