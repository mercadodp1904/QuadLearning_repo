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

        // Student personal information
        lrn: {
            type: String,
            unique: true, // Ensure unique LRN for each student
            required: true,
        },
        name: {
            type: String,
            required: true,
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

        // Grades structure with embedded subjects
        grades: [
            {
                semester: {
                    type: String,
                    enum: ['1st', '2nd'],
                    required: true,
                },
                year: {
                    type: String,
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