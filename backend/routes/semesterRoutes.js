import express from 'express';
import { getSemesters } from '../controllers/semesterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/semesters').get(protect, authorizeRoles('admin', 'teacher'), getSemesters);

export default router;
