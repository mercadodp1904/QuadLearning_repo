import express from 'express';

import { addGrade, updateGrade,  generateForm137, getTeacherSections, fillOutStudentForm, getTeacherDashboard, getStudentData, getTeacherSubjects, getSubjectGrades, getSubjectStudents, getTeacherAdvisoryClass } from '../controllers/teacherController.js';
import { protect, authorizeRoles, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/grades', protect, authorizeRoles('teacher'), addGrade);
router.put('/grades/:id', protect, authorizeRoles('teacher'), updateGrade);


router.post('/generate-form137/:studentId', protect, teacher, generateForm137);
router.get('/sections', protect, teacher, getTeacherSections);


// Update these routes
router.get('/student/:studentId', protect, teacher, getStudentData); // GET route for fetching student data
router.post('/student/:studentId/form', protect, teacher, fillOutStudentForm); // PUT route for updating student data
router.get('/subjects', protect, teacher, getTeacherSubjects); // GET route for fetching teacher subjects
router.get('/subject-grades/:subjectId', protect, teacher, getSubjectGrades); // GET route for fetching subject grades
router.get('/subject-students', protect, teacher, getSubjectStudents); // GET route for fetching subject students
router.get('/advisorySections', protect, teacher, getTeacherAdvisoryClass); // GET route for fetching teacher advisory class
router.get('/dashboard', protect, teacher, getTeacherDashboard); // GET route for fetching teacher dashboard
export default router;

