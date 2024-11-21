import asyncHandler from 'express-async-handler';
import Grade from '../models/gradeModel.js';
import User from '../models/userModel.js';
import Section from '../models/sectionModel.js';
import Student from '../models/studentModel.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const generateForm137 = asyncHandler(async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { additionalFields } = req.body;

        // Fetch the student data
        const student = await Student.findById(studentId)
            .populate('section strand grades.subjects.subject')
            .lean();

        if (!student) {
            res.status(404);
            throw new Error('Student not found');
        }

        // Initialize PDF Document
        const doc = new PDFDocument({ size: 'A4', margin: 30 });

        // Create the 'pdfs' directory if it doesn't exist
        const pdfDirectory = path.join(__dirname, '../../pdfs');
        if (!fs.existsSync(pdfDirectory)) {
            fs.mkdirSync(pdfDirectory, { recursive: true }); // Create the directory recursively if needed
        }

        // Define file path for saving locally
        const filePath = path.join(
            __dirname,
            `../../pdfs/form137-${student.name.replace(/\s+/g, '_')}.pdf`
        );

        // Create a write stream for saving the file
        const writeStream = fs.createWriteStream(filePath);

        // Set up response headers for downloading
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=form137-${student.name.replace(/\s+/g, '_')}.pdf`
        );

        // Pipe the PDF to both the response and the local file
        doc.pipe(res);
        doc.pipe(writeStream);

        // Title Section
        doc.fontSize(16).text('DepEd Form 137', { align: 'center' });
        doc.moveDown(0.5);

        // Student Information Section - formatted with labels and spaces
        const fieldWidth = 200; // Label field width for alignment

        const drawField = (label, value, yPosition) => {
            const labelWidth = 100; // Fixed width for the label
            const fieldWidth = 200; // Width for the value and underline
            const lineOffset = 12; // Vertical offset for the underline
        
            // Draw the label
            doc.fontSize(12)
                .text(`${label}:`, 30, yPosition, { width: labelWidth });
        
            // Draw the value next to the label
            doc.fontSize(12)
                .text(value || '____________________', 30 + labelWidth, yPosition); // Value right next to the label
        
            // Draw the underline (line below the value)
            doc.lineWidth(0.5)
                .moveTo(30 + labelWidth, yPosition + lineOffset) // Position of the underline
                .lineTo(30 + labelWidth + fieldWidth, yPosition + lineOffset) // Length of the underline
                .stroke();
        };

        let currentY = doc.y;

        drawField('LRN', student.lrn, currentY); currentY += 40;
        drawField('Name', student.name, currentY); currentY += 40;
        drawField('Strand', student.strand?.name, currentY); currentY += 40;
        drawField('Year Level', student.yearLevel, currentY); currentY += 40;
        drawField('Section', student.section?.name, currentY); currentY += 40;
        drawField('Address', student.address, currentY); currentY += 40;

        // Teacher's Notes
        const notes = additionalFields?.notes || 'No additional notes provided.';
        doc.fontSize(12).text('Teacher\'s Notes:', 30, currentY, { width: 500, align: 'left' });
        currentY += 20;
        doc.fontSize(12).text(notes, 30, currentY, { width: 500, align: 'left' });
        currentY += 40;

        // Grades Section with Table
        doc.fontSize(14).text('Grades:', { underline: true });
        currentY += 20;

        // Draw table headers
        const tableTop = currentY;
        const tableWidth = 500;
        const columnWidth = tableWidth / 4; // Dividing the table into 4 columns

        // Draw header row
        doc.fontSize(12)
            .text('Subject', 30, tableTop, { width: columnWidth, align: 'center' })
            .text('Midterm', 30 + columnWidth, tableTop, { width: columnWidth, align: 'center' })
            .text('Finals', 30 + 2 * columnWidth, tableTop, { width: columnWidth, align: 'center' })
            .text('Final Rating', 30 + 3 * columnWidth, tableTop, { width: columnWidth, align: 'center' });
        
        currentY = tableTop + 20; // Moving the currentY down after the header

        // Draw table rows with subject grades
        student.grades.forEach((grade) => {
            grade.subjects.forEach((subject) => {
                doc.fontSize(12)
                    .text(subject.subject.name || 'N/A', 30, currentY, { width: columnWidth, align: 'center' })
                    .text(subject.midterm || 'N/A', 30 + columnWidth, currentY, { width: columnWidth, align: 'center' })
                    .text(subject.finals || 'N/A', 30 + 2 * columnWidth, currentY, { width: columnWidth, align: 'center' })
                    .text(subject.finalRating || 'N/A', 30 + 3 * columnWidth, currentY, { width: columnWidth, align: 'center' });
                currentY += 20; // Adding space for the next row
            });
        });

        // Finalize the PDF
        doc.end();

        // Wait for the file to finish writing
        writeStream.on('finish', () => {
            console.log(`Form 137 saved to: ${filePath}`);
        });

        writeStream.on('error', (err) => {
            console.error('Error writing PDF to file:', err);
        });

    } catch (error) {
        if (!res.headersSent) {
            next(error);
        } else {
            console.error('Error occurred during PDF generation:', error);
        }
    }
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