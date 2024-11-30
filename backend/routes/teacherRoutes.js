import express from 'express';

import { addGrade, updateGrade, generateForm137 } from '../controllers/teacherController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/grades', protect, authorizeRoles('teacher'),
            addGrade);
router.put('/grades/:id', protect, authorizeRoles('teacher'),
            updateGrade);

// Route for generating Form 137 for a specific student
router.post(
    '/generate-form137/:studentId',
    //protect, // Ensure the user is authenticated
    //authorizeRoles('teacher'), // Allow only teachers
    generateForm137 // Generate Form 137
);
export default router;

