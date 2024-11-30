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
import ExcelJS from 'exceljs';

// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)


// @desc    Fill out or update a student form
// @route   PUT /api/teachers/student/:studentId/form
// @access  Private (teacher role)
const fillOutStudentForm = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const teacherId = req.user._id; // Authenticated teacher's ID

    // Fetch teacher's assigned sections
    const teacherSections = await Section.find({ teacher: teacherId }).select('_id');

    // Fetch student
    const student = await Student.findById(studentId).populate('section');
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Verify teacher's access
    const isAuthorized = teacherSections.some(section =>
        section._id.equals(student.section?._id)
    );
    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to update this student');
    }

    // Update fields based on the student model
    const {
        firstName,
        lastName,
        middleInitial,
        gender,
        birthdate,
        birthplace,
        address,
        guardian,
        yearLevel,
        section,
        strand,
        school,
        attendance,
        grades,
        contactNumber,
    } = req.body;

    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (middleInitial) student.middleInitial = middleInitial;
    if (gender) student.gender = gender;
    if (birthdate) student.birthdate = birthdate;
    if (birthplace) student.birthplace = birthplace;
    if (address) student.address = address;
    if (guardian) student.guardian = { ...student.guardian, ...guardian };
    if (yearLevel) student.yearLevel = yearLevel;
    if (section) student.section = section;
    if (strand) student.strand = strand;
    if (school) student.school = { ...student.school, ...school };
    if (attendance) student.attendance = { ...student.attendance, ...attendance };
    if (grades) student.grades = grades;
    if (contactNumber) student.contactNumber = contactNumber;

    const updatedStudent = await student.save();

    res.status(200).json({
        message: 'Student profile updated successfully',
        student: updatedStudent,
    });
});


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

// @desc    Import students from Excel file
// @route   POST /api/teachers/student/import
// @access  Private (teacher role)
const importStudents = asyncHandler(async (req, res) => {
    // Check if the file is uploaded
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer); // Load the Excel file from the buffer

    // Access the first sheet in the Excel workbook
    const worksheet = workbook.worksheets[0];

    const students = [];

    // Iterate over each row in the worksheet
    worksheet.eachRow((row, rowIndex) => {
        // Skip the first row if it's the header row
        if (rowIndex === 1) return;

        // Get the data from each row
        const [
            firstName,
            lastName,
            middleInitial,
            gender,
            birthdate,
            province,
            municipality,
            barrio,
            address,
            guardianName,
            guardianOccupation,
            yearLevel,
            sectionId,
            strandId,
            schoolName,
            schoolYear,
            totalYears,
            contactNumber,
        ] = row.values; // Use row.values to get the values from the current row

        // Validate required fields (simplified example)
        if (!firstName || !lastName || !gender || !birthdate || !yearLevel) {
            return; // Skip invalid rows
        }

        // Push the student data into the students array
        students.push({
            firstName,
            lastName,
            middleInitial,
            gender,
            birthdate: new Date(birthdate),
            birthplace: { province, municipality, barrio },
            address,
            guardian: { name: guardianName, occupation: guardianOccupation },
            yearLevel,
            section: sectionId,
            strand: strandId,
            school: { name: schoolName, year: schoolYear },
            attendance: { totalYears },
            contactNumber,
        });
    });

    // Insert the students into the database
    await Student.insertMany(students);

    res.status(201).json({ message: 'Students imported successfully' });
});


// @desc    Add grade for a student
// @route   POST /api/grades
// @access  Private (teacher role)
const addGrade = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to add grades');
    }

    const { studentId, subject, grade, year } = req.body;

    // Validate grade value (assumed to be 0-100)
    if (grade < 0 || grade > 100) {
        res.status(400);
        throw new Error('Grade must be between 0 and 100');
    }

    const newGrade = await Grade.create({
        studentId,
        teacherId: req.user._id,
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

        // Header Section
        const leftImageX = 30;
        const leftImageY = 20;
        const imageWidth = 50;
        const imageHeight = 50;
        doc.rect(leftImageX, leftImageY, imageWidth, imageHeight).stroke(); // Placeholder for the left image

        const rightImageX = 500; // Adjust to the right side of the page
        const rightImageY = 20;
        doc.rect(rightImageX, rightImageY, imageWidth, imageHeight).stroke(); // Placeholder for the right image

        doc.fontSize(16).text('Republic of the Philippines', 50, 20, { align: 'center' });
        doc.fontSize(14).text('Department of Education', 50, 40, { align: 'center' });
        doc.fontSize(12).text('Senior High School Student Permanent Record', 50, 60, { align: 'center' });
        doc.moveDown();

        doc.fontSize(15).text('Learner Information', 225, 100, { underline: true });
        doc.moveDown();
        const drawField = (label, value, x, y, width = 100) => {
            doc.fontSize(9).text(label, x, y, { width });
            doc.rect(x + width - 45, y - 2, 210, 12).stroke();
            doc.text(value || '', x + width - 40, y, { width: 200 });
        };

        let startY = doc.y;

        drawField('LRN', student.lrn || 'N/A', 30, startY);
        drawField('Name', student.name || 'N/A', 30, startY + 20);
        drawField('Strand', student.strand?.name || 'N/A', 30, startY + 40);
        drawField('Year Level', student.yearLevel || 'N/A', 30, startY + 60);
        drawField('Section', student.section?.name || 'N/A', 30, startY + 80);
        drawField('Address', student.address || 'N/A', 30, startY + 100);

        doc.fontSize(15).text('Scholastic Grades\n', 220, 300, { underline: true });

        const drawSemesterTable = (semesterTitle, semesterGrades) => {
            doc.moveDown();
            
            // Center the semester title
            const titleWidth = doc.widthOfString(semesterTitle);
            const xPosition = 225;
            doc.fontSize(10).text(semesterTitle, xPosition, doc.y, { underline: true });
            
            const tableTop = doc.y + 10;
            const tableWidth = 400;
            const columnWidth = tableWidth / 4;
        
            // Draw table headers with centered alignment
            doc.fontSize(9)
                .text('Subject', 30, tableTop, { width: columnWidth, align: 'center' })
                .text('Midterm', 30 + 2 * columnWidth, tableTop, { width: columnWidth, align: 'center' })
                .text('Finals', 30 + 3 * columnWidth, tableTop, { width: columnWidth, align: 'center' })
                .text('Final Rating', 30 + 4 * columnWidth, tableTop, { width: columnWidth, align: 'center' });
        
            let currentY = tableTop + 20;
        
            if (!semesterGrades || semesterGrades.length === 0) {
                doc.fontSize(10).text('No grades available.', { align: 'center' });
            } else {
                // Loop through subjects and draw rows
                semesterGrades.forEach((grade) => {
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
            doc.moveDown();
        };

        // Filter grades by semester
        const firstSemesterGrades = student.grades?.filter((grade) => grade.semester?.name === '1st Semester') || [];
        const secondSemesterGrades = student.grades?.filter((grade) => grade.semester?.name === '2nd Semester') || [];

        drawSemesterTable('Semester: 1st Semester', firstSemesterGrades);
        drawSemesterTable('Semester: 2nd Semester', secondSemesterGrades);

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



export { 
    getGradesByStudent, 
    addGrade, 
    updateGrade, 
    deleteGrade, 
    generateForm137, 
    fillOutStudentForm,
    importStudents 
};