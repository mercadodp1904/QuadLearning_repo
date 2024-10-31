import express from 'express';
import { protect, authorizeRoles} from '../middleware/authMiddleware.js';
const router = express.Router();
import {
    authUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
} from '../controllers/userController.js';


router.post('/auth', authUser);
router.post('/logout', logoutUser);
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);


export default router; 
