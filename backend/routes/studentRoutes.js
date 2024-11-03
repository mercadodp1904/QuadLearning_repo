import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Example route for viewing grades
router.get('/grades', protect, (req, res) => {
    // Logic to get grades for the student
    res.json({ message: 'Viewing student grades' });
});

export default router;