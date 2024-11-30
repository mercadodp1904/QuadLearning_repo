import mongoose from 'mongoose';

const studentSchema = mongoose.Schema(
    {
        // Link to User model for authentication
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Track if the student has completed their profile
        profileCompleted: {
            type: Boolean,
            default: false,
        },

        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        middleInitial: {
            type: String, // Middle initial is optional
            maxlength: 1,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female'], // Restrict to specific values
            required: true,
        },
        birthdate: {
            type: Date,
            required: true,
        },
        birthplace: {
            province: String,
            municipality: String,
            barrio: String,
        },
        address: {
            type: String,
            required: true,
        },

        // Guardian details
        guardian: {
            name: {
                type: String,
                required: true,
            },
            occupation: {
                type: String,
            },
        },

        // Academic information
        yearLevel: {
            type: String,
            required: true,
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section',
        },
        strand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Strand',
        },
        school: {
            name: {
                type: String,
                required: true,
            },
            year: {
                type: String,
                required: true,
            },
        },

        // Attendance data
        attendance: {
            totalYears: {
                type: Number,
                required: true,
            },
        },

        // Grades structure with linked Semester
        grades: [
            {
                semester: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Semester',
                    required: true,
                },
                subjects: [
                    {
                        subject: { // Reference to Subject model
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Subject',
                            required: true,
                        },
                        midterm: {
                            type: Number, // Midterm grade
                        },
                        finals: {
                            type: Number, // Finals grade
                        },
                        finalRating: {
                            type: Number, // Average grade
                        },
                        action: {
                            type: String, // Pass/Fail
                            enum: ['PASSED', 'FAILED'],
                        },
                    },
                ],
            },
        ],

        // Additional metadata
        contactNumber: {
            type: String,
        },
    },
    { timestamps: true } // Add createdAt and updatedAt fields
);

// Create the Student model
const Student = mongoose.model('Student', studentSchema);

export default Student;