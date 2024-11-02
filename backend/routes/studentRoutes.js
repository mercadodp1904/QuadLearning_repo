import express from 'express';
import { protect, authorizeRoles} from '../middleware/authMiddleware.js';
const router = express.Router();
import {
    viewGrades,
  updateProfile
} from '../controllers/studentController.js';

router.post('/auth', authUser);
router.post('/logout', logoutUser);

router
    .route('/profile')
    .put(protect, updateProfile);

router.get('/grades', protect, viewGrades);


export default router; 
