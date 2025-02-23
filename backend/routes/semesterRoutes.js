const express = require('express');
const { getSemesters } = require('../controllers/semesterController.js');
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/semesters').get(protect, authorizeRoles('admin', 'teacher'), getSemesters);

module.exports = router;
