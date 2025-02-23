const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'superadmin'],
        required: true,
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
    }],
    strand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strand',
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
    }],

    yearLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YearLevel',
        required: function() { return this.role === 'student'; }
    },
    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: function() { return this.role === 'student'; }
    },
       // For teachers: multiple semesters
    // For teachers: multiple semesters
    semesters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester'
    }],
       // For teachers only - their advisory section
       advisorySection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: function() { return this.role === 'teacher'; }    
        // This will only be populated for teachers
    },



}, { timestamps: true });

// Add this virtual field to link with Student model
userSchema.virtual('studentInfo', {
    ref: 'Student',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

// Enable virtuals in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });


const User = mongoose.model('User', userSchema);

module.exports = User;