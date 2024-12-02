import express from 'express';

import { addGrade, updateGrade,  generateForm137, getTeacherSections, fillOutStudentForm, getStudentData, getTeacherSubjects, getSubjectGrades, getSubjectStudents } from '../controllers/teacherController.js';
import { protect, authorizeRoles, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/grades', protect, authorizeRoles('teacher'), addGrade);
router.put('/grades/:id', protect, authorizeRoles('teacher'), updateGrade);
// Route for generating Form 137 for a specific student
/* router.post(
    '/generate-form137/:studentId',
    //protect, // Ensure the user is authenticated
    //authorizeRoles('teacher'), // Allow only teachers
    generateForm137 // Generate Form 137
); */

router.get('/generate-form137/:studentId', protect, teacher, generateForm137);
router.get('/sections', protect, teacher, getTeacherSections);

// Update these routes
router.get('/student/:studentId', protect, teacher, getStudentData); // GET route for fetching student data
router.post('/student/:studentId/form', protect, teacher, fillOutStudentForm); // PUT route for updating student data
router.get('/subjects', protect, teacher, getTeacherSubjects); // GET route for fetching teacher subjects
router.get('/subject-grades/:subjectId', protect, teacher, getSubjectGrades); // GET route for fetching subject grades
router.get('/subject-students', protect, teacher, getSubjectStudents); // GET route for fetching subject students

export default router;

