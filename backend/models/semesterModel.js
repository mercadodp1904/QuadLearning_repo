const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        enum: ['1st Semester', '2nd Semester', 'Summer Term']
    },
    strand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strand',
        required: false
    },
    yearLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YearLevel',
        required: false
    },
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject',
        required: false 
}], 
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },

}, { 
    timestamps: true 
});

// Add compound index to ensure unique combination of name, strand, and yearLevel
semesterSchema.index({ name: 1, strand: 1, yearLevel: 1 }, { unique: true });

const Semester = mongoose.model('Semester', semesterSchema);
module.exports = Semester;