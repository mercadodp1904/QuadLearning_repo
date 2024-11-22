import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    }, // Name of the section (e.g., Grade 11 STEM A)
    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }], // Students in this section
    teacher: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: false 
    }], // Assigned teacher
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject',
        required: false // Optional, in case subjects aren't assigned initially
    }], // Assigned subjects
    strand: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Strand',
        required: true 
    }, // Reference to the strand
}, { 
    timestamps: true 
});

const Section = mongoose.model('Section', sectionSchema);

export default Section;