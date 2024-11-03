import express from 'express';
import { addGrade, updateGrade, updateProfile } from '../controllers/teacherController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/grades', protect, authorizeRoles('teacher'), addGrade);
router.put('/grades/:id', protect, authorizeRoles('teacher'), updateGrade);
router.put('/profile', protect, authorizeRoles('teacher'), updateProfile);

export default router;