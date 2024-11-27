import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Section from '../models/sectionModel.js';
import Strand from '../models/strandModel.js';
import Subject from '../models/subjectModel.js';
import Semester from '../models/semesterModel.js';
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
            createdAt: newUser.createdAt
        },
        message: 'User account created successfully',
    });
});

// @desc    Get filtered user accounts by role, ordered by creation date
// @route   GET /api/admin/users/list
// @access  Private (admin role)
const getUserListByRole = asyncHandler(async (req, res) => {
    const { role, limit = 40 } = req.query; // role from dropdown, limit top 40

    // Validate role
    if (!['teacher', 'student'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role specified');
    }

    // Fetch users and populate related fields
    const users = await User.find({ role })
        .sort({ createdAt: 1, username: 1 }) // Sort by timestamp and then alphabetically by username
        .limit(Number(limit))
        .select('username password role createdAt') // Select necessary fields only
        .populate('sections', 'name') // Populate section's name
        .populate('subjects', 'name') // Populate subject's name
        .populate('strand', 'name'); // Populate strand's name

    // Send the populated users as the response
    res.json(users);
});

// @desc    Update user account
// @route   PUT /api/admin/users/:id
// @access  Private (admin role)
const updateUserAccount = asyncHandler(async (req, res) => {
    const { strand, assignedSections, assignedSubjects, semester } = req.body;
    const { id } = req.params;

    console.log('Update request received:', {
        userId: id,
        strand,
        assignedSections,
        assignedSubjects,
        semester
    });

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        res.status(403);
        throw new Error('Not authorized to update user accounts');
    }

    const user = await User.findById(id);
    if (!user) {
        console.log('User not found with ID:', id);
        res.status(404);
        throw new Error('User not found');
    }

    try {
        // Update strand if provided
        if (strand) {
            user.strand = strand;
        }

        // Update section if provided
        if (assignedSections) {
            user.sections = [assignedSections];
        }

        // Update subjects if provided
        if (assignedSubjects) {
            user.subjects = assignedSubjects;
        }

        // Update semester if provided
        if (semester) {
            user.semester = semester;
        }

        const updatedUser = await user.save();
        console.log('User updated successfully:', updatedUser);

        const populatedUser = await User.findById(updatedUser._id)
            .populate('strand', 'name')
            .populate('sections', 'name')
            .populate('subjects', 'name');

        res.json(populatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400);
        throw new Error(`Failed to update user: ${error.message}`);
    }
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

    await User.findByIdAndDelete(id);
    res.json({ message: 'User account deleted successfully' });
});

// @desc    Get all user accounts
// @route   GET /api/admin/users
// @access  Private (admin role)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select('-password') // Exclude the password field
        .populate('strand', 'name') // Replace `strand` ID with the document, selecting only the `name` field
        .populate('sections', 'name') // Replace `section` ID with the document, selecting only the `name` field
        .populate('subjects', 'name'); // Replace `subjects` IDs with documents, selecting only the `name` field
    res.json(users);
});


// @desc    Get all strands
// @route   GET /api/admin/strands
// @access  Private (admin role)
const getAllStrands = asyncHandler(async (req, res) => {
    const strands = await Strand.find({})
        .populate('subjects', 'name')
        .populate('sections', 'name');
    res.status(200).json(strands);
});

// @desc    Get all sections
// @route   GET /api/admin/sections
// @access  Private (admin role)
const getAllSections = asyncHandler(async (req, res) => {
    const sections = await Section.find().populate('strand').populate('teacher').populate('subjects'); // Populate strand info
    res.json(sections);
});



// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private (admin role)
const getAllSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find()
        .populate('semester', 'name')
        .populate('sections', 'name')
        .populate('teachers', 'username'); // Ensure this is properly populated

    res.json(subjects);
});




// @desc    Create a new strand
// @route   POST /api/admin/strands
// @access  Private (admin role)
const createStrand = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Check if the strand already exists
    const strandExists = await Strand.findOne({ name });
    if (strandExists) {
        res.status(400);
        throw new Error('Strand already exists');
    }

    // Create a new strand with only name and description
    const newStrand = await Strand.create({
        name,
        description
    });

    if (!newStrand) {
        res.status(400);
        throw new Error('Failed to create strand');
    }

    // Respond with the newly created strand
    res.status(201).json(newStrand);
});




// @desc    Update a strand
// @route   PUT /api/admin/strands/:id
// @access  Private (admin role)
const updateStrand = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { id } = req.params;

    const strand = await Strand.findById(id);
    if (!strand) {
        res.status(404);
        throw new Error('Strand not found');
    }

    strand.name = name;
    strand.description = description;
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

    await Strand.findByIdAndDelete(id);
    res.json({ message: 'Deleted successfully' });
});

// @desc    Create a new section
// @route   POST /api/admin/sections
// @access  Private (admin role)
const createSection = asyncHandler(async (req, res) => {
    const { name, strand, teacher, subjects } = req.body;

    // Validate the strand
    const strandRecord = await Strand.findById(strand);
    if (!strandRecord) {
        return res.status(404).json({ message: 'Strand not found' }); // Ensure valid JSON is sent
    }


    // Create new section
    const newSection = new Section({
        name,
        strand,
    });

    await newSection.save();

    // Update strand with new section
    strandRecord.sections.push(newSection._id);
    await strandRecord.save();

    // Send a successful response with JSON data
    res.status(201).json(newSection);
});


// @desc    Update a section
// @route   PUT /api/admin/sections/:id
// @access  Private (admin role)
const updateSection = asyncHandler(async (req, res) => {
    const { name, strand } = req.body;
    const { id } = req.params;

    const section = await Section.findById(id);
    if (!section) {
        res.status(404);
        throw new Error('Section not found');
    }

    section.name = name;
    section.strand = strand;
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

    await Section.findByIdAndDelete(id);
    res.json({ message: 'Section deleted successfully' });
});

// @desc    Create a new subject
// @route   POST /api/admin/subjects
// @access  Private (admin role)
const createSubject = asyncHandler(async (req, res) => {
    const { name, code, semester, sections } = req.body;

    // Check if the subject already exists by its code
    const subjectExists = await Subject.findOne({ code });
    if (subjectExists) {
        res.status(400);
        throw new Error('Subject already exists');
    }

    // Validate semester
    if (!semester) {
        res.status(400);
        throw new Error('Semester is required');
    }

    // Validate that the semester exists in the database
    const semesterExists = await Semester.findById(semester);
    if (!semesterExists) {
        res.status(400);
        throw new Error('Invalid semester');
    }   

    // Create the new subject with teachers
    const newSubject = await Subject.create({
        name,
        code,
        semester,
        sections,
    });

    res.status(201).json(newSubject); // Respond with the newly created subject
});



// @desc    Update a subject
// @route   PUT /api/admin/subjects/:id
// @access  Private (admin role)
const updateSubject = asyncHandler(async (req, res) => {
    const { name, code, semester, sections } = req.body;
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
        res.status(404);
        throw new Error('Subject not found');
    }

    subject.name = name;
    subject.code = code;
    subject.semester = semester;
    subject.sections = sections;
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

    await Subject.findByIdAndDelete(id);
    res.json({ message: 'User account deleted successfully' });
});

// @desc    Create a new semester
// @route   POST /api/admin/semesters
// @access  Private (admin role)
const createSemester = asyncHandler(async (req, res) => {
    const { name, startDate, endDate } = req.body;

    // Validate that the startDate and endDate are provided
    if (!startDate || !endDate) {
        res.status(400);
        throw new Error('Start date and End date are required');
    }

    // Check if a semester with the same name already exists
    const existingSemester = await Semester.findOne({ name });
    if (existingSemester) {
        res.status(400);
        throw new Error('Semester already exists');
    }

    // Create a new semester with the startDate and endDate
    const newSemester = await Semester.create({
        name,
        startDate: new Date(startDate),  // Ensure startDate is a Date object
        endDate: new Date(endDate),      // Ensure endDate is a Date object
    });

    // Respond with the newly created semester
    res.status(201).json(newSemester);
});


// @desc    Update a semester
// @route   PUT /api/admin/semesters/:id
// @access  Private (admin role)
const updateSemester = asyncHandler(async (req, res) => {
    const { name, startDate, endDate } = req.body;
    const { id } = req.params;

    const semester = await Semester.findById(id);
    if (!semester) {
        res.status(404);
        throw new Error('Semester not found');
    }

    // Update the semester's name
    semester.name = name || semester.name;
    semester.startDate = startDate || semester.startDate;
    semester.endDate = endDate || semester.endDate;

    const updatedSemester = await semester.save();

    res.json(updatedSemester);
});

// @desc    Delete a semester
// @route   DELETE /api/admin/semesters/:id
// @access  Private (admin role)
const deleteSemester = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the semester by ID
    const semester = await Semester.findById(id);
    if (!semester) {
        res.status(404);
        throw new Error('Semester not found');
    }

    // Use deleteOne instead of remove
    await Semester.deleteOne({ _id: id });

    res.json({ message: 'Semester deleted successfully' });
});

// @desc    Get all strands
// @route   GET /api/admin/strands
// @access  Private (admin role)
const getAllSemesters = asyncHandler(async (req, res) => {
    const semester = await Semester.find();
    res.json(semester);
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
    getAllSubjects,
    getUserListByRole,
    createSemester,
    updateSemester,
    deleteSemester,
    getAllSemesters
};