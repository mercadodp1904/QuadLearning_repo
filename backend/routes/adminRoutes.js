import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { /* createAdmin, */ updateUserAccount, /* getUserList */ /* assignStudentToTeacher */ createStrand, getAllStrands, getAllUsers, createUserAccount } from '../controllers/adminController.js';


const router = express.Router();
/* router.route('/users').get(protect, authorizeRoles('admin'), getUserList); */
/* router.route('/:id').put(protect, authorizeRoles('admin'), updateUserAccount); */
/* router.route('/assign-student/:studentId').put(protect, authorizeRoles('admin'), assignStudentToTeacher); */
router.route('/addStrands').post(protect, authorizeRoles('admin'), createStrand);
router.route('/getStrands').get(protect, authorizeRoles('admin'), getAllStrands);
router.route('/addUsers').post(protect, authorizeRoles('admin'), createUserAccount);
router.route('/getUsers').get(protect, authorizeRoles('admin'), getAllUsers);


export default router;