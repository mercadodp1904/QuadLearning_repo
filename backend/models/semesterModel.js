import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject' 
    }]
});

const Semester = mongoose.model('Semester', semesterSchema);

export default Semester;