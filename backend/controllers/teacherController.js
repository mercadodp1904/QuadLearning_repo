import asyncHandler from 'express-async-handler';
import Grade from '../models/gradeModel.js';
import User from '../models/userModel.js'; // Ensure you import the User model

// @desc    Add grade for a student
// @route   POST /api/grades
// @access  Private (teacher role)
const addGrade = asyncHandler(async (req, res) => {
    const { studentId, subject, grade, year } = req.body;

    // Check if the user making the request is a teacher
    if (req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to add grades');
    }

    const newGrade = await Grade.create({
        studentId,
        teacherId: req.user._id, // Get teacher's ID from the request
        subject,
        grade,
        year,
    });

    res.status(201).json(newGrade);
});

// @desc    Update grade for a student
// @route   PUT /api/grades/:id
// @access  Private (teacher role)
const updateGrade = asyncHandler(async (req, res) => {
    const { subject, grade, year } = req.body;
    const { id } = req.params; // Get the grade ID from the URL

    // Check if the user making the request is a teacher
    if (req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to update grades');
    }

    // Find the grade to update
    const existingGrade = await Grade.findById(id);

    if (!existingGrade) {
        res.status(404);
        throw new Error('Grade not found');
    }

    // Update the grade details
    existingGrade.subject = subject || existingGrade.subject;
    existingGrade.grade = grade || existingGrade.grade;
    existingGrade.year = year || existingGrade.year;

    const updatedGrade = await existingGrade.save();

    res.json(updatedGrade);
});

// @desc    Update teacher profile
// @route   PUT /api/teachers/profile
// @access  Private (teacher role)
const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, subject } = req.body; // Capture the details to update

    // Find the teacher by ID
    const teacher = await User.findById(req.user._id);

    if (!teacher) {
        res.status(404);
        throw new Error('Teacher not found');
    }

    // Update the teacher's profile details
    teacher.name = name || teacher.name; // Keep existing value if not provided
    teacher.email = email || teacher.email;
    teacher.subject = subject || teacher.subject; // Assuming you have a subject field

    const updatedTeacher = await teacher.save();

    res.json({
        _id: updatedTeacher._id,
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        subject: updatedTeacher.subject,
    });
});

export { addGrade, updateGrade, updateProfile };