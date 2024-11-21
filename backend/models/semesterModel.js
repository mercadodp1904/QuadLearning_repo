import mongoose from 'mongoose';

// Define the semester schema
const semesterSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        enum: ['1st Semester', '2nd Semester', 'Summer Term'], // Assuming two semesters per year, modify if necessary
    },
    startDate: {
        type: Date, // Track when the semester starts
        required: true,
    },
    endDate: {
        type: Date, // Track when the semester ends
        required: true,
    },
    // You can link this schema to other models like grades or subjects
    // For example, you can have a reference to the grades in the semester
    // grades: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Grade',
    // }],
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

const Semester = mongoose.model('Semester', semesterSchema);

export default Semester;