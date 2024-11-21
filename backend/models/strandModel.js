import mongoose from 'mongoose';

const strandSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String 
    },
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject' 
    }], 
    sections: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Section' 
    }],
});

const Strand = mongoose.model('Strand', strandSchema);

export default Strand;