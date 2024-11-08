import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { createAdmin, updateUserAccount, getUserList, assignStudentToTeacher } from '../controllers/adminController.js';

const router = express.Router();

router.route('/users').get(protect, authorizeRoles('admin'), getUserList);
router.route('/:id').put(protect, authorizeRoles('admin'), updateUserAccount);
router.route('/assign-student/:studentId').put(protect, authorizeRoles('admin'), assignStudentToTeacher);


export default router;