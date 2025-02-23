const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const {
    updateUserAccount,
    resetUserPassword,
    initializeYearLevels,
    getAllYearLevels,
    filterSubjects,
    getAvailableAdvisorySections,
    createStrand,
    getAllStrands,
    getAllUsers,
    createUserAccount,
    deleteUserAccount,
    getUserListByRole,
    createSubject,
    getAllSubjects,
    createSemester,
    deleteSemester,
    getAllSemesters,
    createSection,
    getAllSections,
    deleteSubject,
    updateSubject,
    deleteStrand,
    updateStrand,
    updateSection,
    deleteSection,
    updateSemester
} = require('../controllers/adminController.js');

const router = express.Router();

router.route('/users/:id').delete(protect, authorizeRoles('admin'), deleteUserAccount);
router.route('/addUsers').post(protect, authorizeRoles('admin'), createUserAccount);
router.route('/getUsers').get(protect, authorizeRoles('admin'), getAllUsers);
router.route('/users').get(protect, authorizeRoles('admin'), getUserListByRole);
router.route('/users/:id').put(protect, authorizeRoles('admin'), updateUserAccount);
router.route('/resetPassword/:id').put(protect, authorizeRoles('admin'), resetUserPassword);

router.route('/addStrands').post(protect, authorizeRoles('admin'), createStrand);
router.route('/getStrands').get(protect, authorizeRoles('admin'), getAllStrands);
router.route('/strands/:id').delete(protect, authorizeRoles('admin'), deleteStrand);
router.route('/strands/:id').put(protect, authorizeRoles('admin'), updateStrand);

router.route('/addSubjects').post(protect, authorizeRoles('admin'), createSubject);
router.route('/getSubjects').get(protect, authorizeRoles('admin'), getAllSubjects);
router.route('/subjects/:id').delete(protect, authorizeRoles('admin'), deleteSubject);
router.route('/subjects/:id').put(protect, authorizeRoles('admin'), updateSubject);
router.route('/subjects/filter').post(protect, authorizeRoles('admin'), filterSubjects);

router.route('/getSemesters').get(protect, authorizeRoles('admin'), getAllSemesters);
router.route('/addSemesters').post(protect, authorizeRoles('admin'), createSemester);
router.route('/semesters/:id').delete(protect, authorizeRoles('admin'), deleteSemester);
router.route('/semesters/:id').put(protect, authorizeRoles('admin'), updateSemester);

router.route('/getSections').get(protect, authorizeRoles('admin'), getAllSections);
router.route('/addSections').post(protect, authorizeRoles('admin'), createSection);
router.route('/sections/:id').put(protect, authorizeRoles('admin'), updateSection);
router.route('/sections/:id').delete(protect, authorizeRoles('admin'), deleteSection);
router.route('/advisorySections').get(protect, authorizeRoles('admin'), getAvailableAdvisorySections);

router.post('/yearLevels/init', protect, authorizeRoles('admin'), initializeYearLevels);
router.route('/yearLevels').get(protect, authorizeRoles('admin'), getAllYearLevels);

module.exports = router;