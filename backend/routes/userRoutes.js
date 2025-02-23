const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { authUser, logoutUser } = require('../controllers/userController.js');

const router = express.Router();

router.post('/auth', authUser);
router.post('/logout', logoutUser);

module.exports = router;