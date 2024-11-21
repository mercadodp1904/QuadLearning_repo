import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
const router = express.Router();
import {
    authUser,
    logoutUser,
} from '../controllers/userController.js';



router.post('/auth', authUser);
router.post('/logout', logoutUser);

export default router;