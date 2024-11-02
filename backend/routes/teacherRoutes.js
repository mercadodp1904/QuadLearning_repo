import express from 'express';
import { protect, authorizeRoles} from '../middleware/authMiddleware.js';
const router = express.Router();

import {
    addGrade,
    updateGrade,
    updateProfile
} from '../controllers/teacherController.js';

router.post('/auth', authUser);
router.post('/logout', logoutUser);

router
    .route('/profile')
    .put(protect, updateProfile);

router
    .route('/grades')
    .put(protect, updateGrade)
    .post(protect, addGrade);


export default router;
//di ko sure kung eto na lahat -D
