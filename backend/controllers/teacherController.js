import asyncHandler from 'express-async-handler';
import Grade from '../models/gradeModel.js';
import User from '../models/userModel.js';
import Section from '../models/sectionModel.js';
import Student from '../models/studentModel.js';
import PDFDocument from 'pdfkit';

// @desc    Get grades for a specific student
// @route   GET /api/grades/student/:studentId
// @access  Private (teacher role)
const getGradesByStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // Check if the user making the request is a teacher
    if (req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to view grades');
    }

    // Verify if the teacher is assigned to the same section as the student
    const teacherSections = await Section.find({ teacher: req.user._id }).populate('students');
    const student = await User.findById(studentId).populate('section');

    if (!student || student.role !== 'student' || !student.isActive) {
        res.status(404);
        throw new Error('Student not found or inactive');
    }

    // Check if the student is in any of the teacher's sections
    const isAssignedToSection = teacherSections.some(section => section.students.some(s => s._id.equals(student._id)));

    if (!isAssignedToSection) {
        res.status(403);
        throw new Error('Not authorized to view grades for this student');
    }

    // Fetch grades for the active student
    const grades = await Grade.find({ studentId }).populate('subject').sort({ year: 1 });

    if (!grades.length) {
        res.status(404);
        throw new Error('No grades found for this student');
    }

    res.json(grades);
});

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

    // Validate grade value (assumed to be 0-100)
    if (grade < 0 || grade > 100) {
        res.status(400);
        throw new Error('Grade must be between 0 and 100');
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
    const { id } = req.params;

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

    // Validate grade value
    if (grade < 0 || grade > 100) {
        res.status(400);
        throw new Error('Grade must be between 0 and 100');
    }

    // Update the grade details
    existingGrade.subject = subject || existingGrade.subject;
    existingGrade.grade = grade || existingGrade.grade;
    existingGrade.year = year || existingGrade.year;

    const updatedGrade = await existingGrade.save();

    res.json(updatedGrade);
});

// @desc    Delete a grade for a student
// @route   DELETE /api/grades/:id
// @access  Private (teacher role)
const deleteGrade = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if the user making the request is a teacher
    if (req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to delete grades');
    }

    // Find the grade to delete
    const existingGrade = await Grade.findById(id);

    if (!existingGrade) {
        res.status(404);
        throw new Error('Grade not found');
    }

    // Delete the grade
    await existingGrade.remove();

    res.json({ message: 'Grade removed' });
});

// @desc    Update teacher profile
// @route   PUT /api/teachers/profile
// @access  Private (teacher role)
const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, subject } = req.body;

    // Find the teacher by ID
    const teacher = await User.findById(req.user._id);

    if (!teacher) {
        res.status(404);
        throw new Error('Teacher not found');
    }

    // Update the teacher's profile details
    teacher.name = name || teacher.name;
    teacher.email = email || teacher.email;
    teacher.subject = subject || teacher.subject;

    const updatedTeacher = await teacher.save();

    res.json({
        _id: updatedTeacher._id,
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        subject: updatedTeacher.subject,
    });
});

// @desc    Generate Form 137 for a student
// @route   GET /api/grades/form137/:studentId
// @access  Private (teacher role)
const generateForm137 = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { additionalFields } = req.body; // Data provided by the teacher

    // Fetch the student data
    console.log('Received studentId:', studentId);

    const student = await User.findById(studentId)
        .populate('section strand subjects')
        .lean();

    console.log('Student fetched:', student);

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // PDF Generation Logic
    const doc = new PDFDocument({ size: 'A4', margin: 30 });

    // Set up response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=form137-${student.name}.pdf`);

    // Pipe the document to the response
    doc.pipe(res);

    // ===== Sample Dynamic Data =====
    const studentData = {
        name: student.name,
        strand: student.strand.name,
        section: student.section.name,
        yearLevel: student.yearLevel,
        subjects: student.subjects,
        teacherNotes: additionalFields.notes || 'No notes provided.', // Example input
    };

    // ===== Generate the PDF =====
    doc.fontSize(10).text('DepEd Form 137-A', { align: 'right' });
    doc.text(`LRN: ${student.lrn || 'N/A'}`, { align: 'right' });
    doc.fontSize(14).text('Department of Education', { align: 'center' });
    doc.text('Region V', { align: 'center' });
    doc.text('Division of Sorsogon', { align: 'center' });
    doc.text(`${studentData.strand} Strand`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Name: ${studentData.name}`);
    doc.text(`Year Level: ${studentData.yearLevel}`);
    doc.text(`Section: ${studentData.section}`);
    doc.text(`Teacher's Notes: ${studentData.teacherNotes}`);
    doc.moveDown();

    studentData.subjects.forEach((subject, index) => {
        doc.text(`${index + 1}. ${subject.name}`);
    });

    doc.moveDown();
    doc.text('Generated by Real-time Student Record System', { align: 'center' });

    // Finalize the PDF
    doc.end();
});

// @desc    Get students assigned to the adviser
// @route   GET /api/teachers/adviser/students
// @access  Private (teacher role)
const getAdviserStudents = asyncHandler(async (req, res) => {
    const adviserId = req.user._id;

    const sections = await Section.find({ adviser: adviserId }).populate('students');

    const students = sections.flatMap(section => section.students);

    res.json(students);
});


export { 
    getGradesByStudent, 
    addGrade, 
    updateGrade, 
    deleteGrade, 
    updateProfile, 
    generateForm137, 
    getAdviserStudents 
};