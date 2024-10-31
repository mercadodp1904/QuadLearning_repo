import express from 'express';
const router = express.Router();
import { protect, authorizeRoles} from '../middleware/authMiddleware.js';
import { createAdmin } from '../controllers/superadminController.js';

// Route for superadmin to create a new admin
router.post('/create-admin', protect, authorizeRoles('superadmin'), createAdmin);

export default router;