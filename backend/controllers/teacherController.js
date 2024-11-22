import asyncHandler from 'express-async-handler';
import Grade from '../models/gradeModel.js';

import User from '../models/userModel.js';
import Section from '../models/sectionModel.js';
import Student from '../models/studentModel.js';
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

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
    const teacherSections = await Section.find({ teacherId: req.user._id });
    const student = await User.findById(studentId).populate('sectionId'); // Ensure section info is populated

    if (!student || student.role !== 'student' || !student.isActive) {
        res.status(404);
        throw new Error('Current student not found or inactive');
    }

    // Check if the student is in any of the teacher's sections
    const isAssignedToSection = teacherSections.some(section => section._id.equals(student.sectionId._id));

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
    const { id } = req.params; // Get the grade ID from the URL

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

// @desc    Generate Form 137 for a student
// @route   GET /api/grades/form137/:studentId
// @access  Private (teacher role)

const generateForm137 = asyncHandler(async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId)
            .populate('section strand grades.subjects.subject grades.semester')
            .lean();
            console.log(student.grades); // Check if grades.semester is populated
        if (!student) {
            res.status(404);
            throw new Error('Student not found');
        }

        const doc = new PDFDocument({ size: 'A4', margin: 30 });
        const pdfDirectory = path.join(__dirname, '../../pdfs');
        if (!fs.existsSync(pdfDirectory)) {
            fs.mkdirSync(pdfDirectory, { recursive: true });
        }

        const sanitizedStudentName = student.name.replace(/[\/\\?%*:|"<>]/g, '_');
        const filePath = path.join(pdfDirectory, `form137-${sanitizedStudentName}.pdf`);
        const writeStream = fs.createWriteStream(filePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=form137-${sanitizedStudentName}.pdf`);

        doc.pipe(res);
        doc.pipe(writeStream);

        doc.font('Helvetica');

         // Header Section with Image Placeholders
         const leftImageX = 30;
         const leftImageY = 20;
         const imageWidth = 50;
         const imageHeight = 50;
         doc.rect(leftImageX, leftImageY, imageWidth, imageHeight).stroke(); // Placeholder rectangle for the left image
 
         const rightImageX = 500; // Adjust to the right side of the page
         const rightImageY = 20;
         doc.rect(rightImageX, rightImageY, imageWidth, imageHeight).stroke(); // Placeholder rectangle for the right image
        doc.fontSize(16).text('Republic of the Philippines', 50, 20, { align: 'center' });
        doc.fontSize(14).text('Department of Education', 50, 40, { align: 'center' });
        doc.fontSize(12).text('Senior High School Student Permanent Record', 50, 60, { align: 'center' });
        doc.moveDown();

        doc.fontSize(15).text('Learner Information', 230, 125, { underline: true });
        const drawField = (label, value, x, y, width = 100) => {
            doc.fontSize(9).text(label, x, y, { width });
            doc.rect(x + width - 45, y - 2, 210, 12).stroke();
            doc.text(value || '', x + width - 40, y, { width: 200 });
        };
        doc.moveDown();
        

        let startY = doc.y;


        

        drawField('LRN', student.lrn || 'N/A', 30, startY);
        drawField('Name', student.name || 'N/A', 30, startY + 20);
        drawField('Strand', student.strand?.name || 'N/A', 30, startY + 40);
        drawField('Year Level', student.yearLevel || 'N/A', 30, startY + 60);
        drawField('Section', student.section?.name || 'N/A', 30, startY + 80);
        drawField('Address', student.address || 'N/A', 30, startY + 100);

        doc.fontSize(15).text('Scholastic Grades\n', 230, 300, { underline: true });
        doc.moveDown();
        doc.fontSize(10).text('Semester: 1st Semester', { underline: true });
        doc.moveDown();
        const tableTop = doc.y + 10; 
        const tableWidth = 400;
        const columnWidth = tableWidth / 4;
        

        
       
       

        doc.fontSize(9)
            .text('Subject', 30, tableTop, { width: columnWidth, align: 'center' })
            .text('Midterm', 30 + 2 * columnWidth, tableTop, { width: columnWidth, align: 'center' })
            .text('Finals', 30 + 3 * columnWidth, tableTop, { width: columnWidth, align: 'center' })
            .text('Final Rating', 30 + 4 * columnWidth, tableTop, { width: columnWidth, align: 'center' });

        let currentY = tableTop + 20;

        if (!student.grades || student.grades.length === 0) {
            doc.fontSize(10).text('No grades available.', { align: 'center' });
        } else {
            student.grades.forEach((grade) => {
                grade.subjects.forEach((subject) => {
                    doc.fontSize(9)
                        .text(subject.subject.name || 'N/A', 30, currentY, { width: columnWidth, align: 'center' })
                        .text(subject.midterm || 'N/A', 30 + 2 * columnWidth, currentY, { width: columnWidth, align: 'center' })
                        .text(subject.finals || 'N/A', 30 + 3 * columnWidth, currentY, { width: columnWidth, align: 'center' })
                        .text(subject.finalRating || 'N/A', 30 + 4 * columnWidth, currentY, { width: columnWidth, align: 'center' });
                    currentY += 20;
                });
            });
        }

        doc.end();

        writeStream.on('finish', () => {
            console.log(`Form 137 saved to: ${filePath}`);
        });

        writeStream.on('error', (err) => {
            console.error('Error writing PDF to file:', err);
            res.status(500).send('Error generating the PDF.');
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

    // Find sections where this teacher is an adviser
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