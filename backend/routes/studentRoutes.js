import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Example route for viewing grades, accessible only to authenticated students
router.get('/grades', protect, authorizeRoles('student'), (req, res) => {
    // Logic to get grades for the student
    res.json({ message: 'Viewing student grades' });
});

export default router;