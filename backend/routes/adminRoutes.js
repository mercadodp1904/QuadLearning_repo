import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { /* createAdmin, */ updateUserAccount, /* getUserList */ /* assignStudentToTeacher */ createStrand, getAllStrands, getAllUsers, createUserAccount } from '../controllers/adminController.js';

const router = express.Router();

/* router.route('/users').get(protect, authorizeRoles('admin'), getUserList); */
router.route('/:id').put(protect, authorizeRoles('admin'), updateUserAccount);
/* router.route('/assign-student/:studentId').put(protect, authorizeRoles('admin'), assignStudentToTeacher); */
router.route('/Strands').post(createStrand);
router.route('/Strands').get(getAllStrands);
router.route('/AdminViewAllUsersScreen').post(createUserAccount);
router.route('/AdminViewAllUsersScreen').get(getAllUsers);


export default router;