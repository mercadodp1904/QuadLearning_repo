import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Section from '../models/sectionModel.js';
import Strand from '../models/strandModel.js';
import Subject from '../models/subjectModel.js';
import bcrypt from 'bcryptjs';

// @desc    Create user accounts for teacher or student
// @route   POST /api/admin/users
// @access  Private (admin role)
const createUserAccount = asyncHandler(async (req, res) => {
    const { username, password, role, assignedSections, assignedSubjects, strand } = req.body;

    if (!['teacher', 'student'].includes(role)) {
        res.status(400);
        throw new Error('Role must be either teacher or student');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        res.status(400);
        throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });

    if (role === 'teacher' && assignedSections && assignedSubjects) {
        newUser.sections = assignedSections;
        newUser.subjects = assignedSubjects;
    } else if (role === 'student' && strand && assignedSections) {
        newUser.strand = strand;
        newUser.sections = [assignedSections];
    }

    await newUser.save();

    res.status(201).json({
        success: true,
        data: {
            _id: newUser._id,
            username: newUser.username,
            role: newUser.role,
        },
        message: 'User account created successfully',
    });
});
// @desc    Get filtered user accounts by role, ordered by creation date
// @route   GET /api/admin/users/list
// @access  Private (admin role)
const getUserListByRole = asyncHandler(async (req, res) => {
    const { role, limit = 40 } = req.query; // role from dropdown, limit top 40

    if (!['teacher', 'student'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role specified');
    }

    const users = await User.find({ role })
        .sort({ createdAt: 1, username: 1 }) // Sort by timestamp and then alphabetically by username
        .limit(Number(limit))
        .select('username password role createdAt'); // Select necessary fields only

    res.json(users);
});
// @desc    Update user account
// @route   PUT /api/admin/users/:id
// @access  Private (admin role)
const updateUserAccount = asyncHandler(async (req, res) => {
    const { username, role, password } = req.body;
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        res.status(403);
        throw new Error('Not authorized to update user accounts');
    }

    const user = await User.findById(id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(400);
            throw new Error('Username already taken');
        }
        user.username = username;
    }

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
    });
});

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (admin role)
const deleteUserAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        res.status(403);
        throw new Error('Not authorized to delete user accounts');
    }

    const user = await User.findById(id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await user.remove();
    res.json({ message: 'User account deleted successfully' });
});

// @desc    Get all user accounts
// @route   GET /api/admin/users
// @access  Private (admin role)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password'); // Exclude password for security
    res.json(users);
});

// @desc    Get all strands
// @route   GET /api/admin/strands
// @access  Private (admin role)
const getAllStrands = asyncHandler(async (req, res) => {
    const strands = await Strand.find();
    res.json(strands);
});

// @desc    Get all sections
// @route   GET /api/admin/sections
// @access  Private (admin role)
const getAllSections = asyncHandler(async (req, res) => {
    const sections = await Section.find().populate('strand'); // Populate strand info
    res.json(sections);
});

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private (admin role)
const getAllSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find();
    res.json(subjects);
});


// @desc    Create a new strand
// @route   POST /api/admin/strands
// @access  Private (admin role)
const createStrand = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const strandExists = await Strand.findOne({ name });
    if (strandExists) {
        res.status(400);
        throw new Error('Strand already exists');
    }

    const newStrand = await Strand.create({ name });
    res.status(201).json(newStrand);
});

// @desc    Update a strand
// @route   PUT /api/admin/strands/:id
// @access  Private (admin role)
const updateStrand = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    const strand = await Strand.findById(id);
    if (!strand) {
        res.status(404);
        throw new Error('Strand not found');
    }

    strand.name = name;
    const updatedStrand = await strand.save();

    res.json(updatedStrand);
});

// @desc    Delete a strand
// @route   DELETE /api/admin/strands/:id
// @access  Private (admin role)
const deleteStrand = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const strand = await Strand.findById(id);
    if (!strand) {
        res.status(404);
        throw new Error('Strand not found');
    }

    await strand.remove();
    res.json({ message: 'Strand deleted successfully' });
});

// @desc    Create a new section
// @route   POST /api/admin/sections
// @access  Private (admin role)
const createSection = asyncHandler(async (req, res) => {
    const { name, strandId } = req.body;

    const strand = await Strand.findById(strandId);
    if (!strand) {
        res.status(404);
        throw new Error('Strand not found');
    }

    const newSection = await Section.create({ name, strand: strandId });
    strand.sections.push(newSection._id);
    await strand.save();

    res.status(201).json(newSection);
});

// @desc    Update a section
// @route   PUT /api/admin/sections/:id
// @access  Private (admin role)
const updateSection = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    const section = await Section.findById(id);
    if (!section) {
        res.status(404);
        throw new Error('Section not found');
    }

    section.name = name;
    const updatedSection = await section.save();

    res.json(updatedSection);
});

// @desc    Delete a section
// @route   DELETE /api/admin/sections/:id
// @access  Private (admin role)
const deleteSection = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const section = await Section.findById(id);
    if (!section) {
        res.status(404);
        throw new Error('Section not found');
    }

    await section.remove();
    res.json({ message: 'Section deleted successfully' });
});

// @desc    Create a new subject
// @route   POST /api/admin/subjects
// @access  Private (admin role)
const createSubject = asyncHandler(async (req, res) => {
    const { name, code } = req.body;

    const subjectExists = await Subject.findOne({ code });
    if (subjectExists) {
        res.status(400);
        throw new Error('Subject already exists');
    }

    const newSubject = await Subject.create({ name, code });
    res.status(201).json(newSubject);
});

// @desc    Update a subject
// @route   PUT /api/admin/subjects/:id
// @access  Private (admin role)
const updateSubject = asyncHandler(async (req, res) => {
    const { name, code } = req.body;
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    subject.name = name;
    subject.code = code;
    const updatedSubject = await subject.save();

    res.json(updatedSubject);
});

// @desc    Delete a subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private (admin role)
const deleteSubject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    await subject.remove();
    res.json({ message: 'Subject deleted successfully' });
});




// Exporting functions
export { 
    createUserAccount,
    updateUserAccount,
    deleteUserAccount,
    createStrand,
    updateStrand,
    deleteStrand,
    createSection,
    updateSection,
    deleteSection,
    createSubject,
    updateSubject,
    deleteSubject, 
    getAllUsers,
    getAllStrands,
    getAllSections,
    getAllSubjects
};