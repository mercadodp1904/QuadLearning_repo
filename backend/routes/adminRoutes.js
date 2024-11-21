import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { /* createAdmin, */ updateUserAccount, /* getUserList */ /* assignStudentToTeacher */ createStrand, getAllStrands, getAllUsers, createUserAccount, deleteUserAccount, getUserListByRole, createSubject, getAllSubjects, createSemester, deleteSemester, getAllSemesters, createSection, getAllSections } from '../controllers/adminController.js';


const router = express.Router();
/* router.route('/users').get(protect, authorizeRoles('admin'), getUserList); */
/* router.route('/:id').put(protect, authorizeRoles('admin'), updateUserAccount); */
/* router.route('/assign-student/:studentId').put(protect, authorizeRoles('admin'), assignStudentToTeacher); */
router.route('/users/:id').delete(protect, authorizeRoles('admin'), deleteUserAccount);
router.route('/addStrands').post(protect, authorizeRoles('admin'), createStrand);
router.route('/getStrands').get(protect, authorizeRoles('admin'), getAllStrands);
router.route('/addUsers').post(protect, authorizeRoles('admin'), createUserAccount);
router.route('/getUsers').get(protect, authorizeRoles('admin'), getAllUsers);
router.route('/users').get(protect, authorizeRoles('admin'), getUserListByRole);
router.route('/addSubjects').post(protect, authorizeRoles('admin'), createSubject);
router.route('/getSubjects').get(protect, authorizeRoles('admin'), getAllSubjects);


router.route('/getSemesters').get(protect, authorizeRoles('admin'), getAllSemesters);
router.route('/addSemesters').post(protect, authorizeRoles('admin'), createSemester);
router.route('/semesters/:id').delete(protect, authorizeRoles('admin'), deleteSemester);

router.route('/getSections').get(protect, authorizeRoles('admin'), getAllSections);
router.route('/addSections').post(protect, authorizeRoles('admin'), createSection);

export default router;