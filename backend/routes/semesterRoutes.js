import express from 'express';
import { getSemesters } from '../controllers/semesterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getSemesters);

export default router;