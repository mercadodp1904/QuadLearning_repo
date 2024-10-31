import asyncHandler from 'express-async-handler';  
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Superadmin creates a new admin
// @route   POST /api/superadmin/create-admin
// @access  Private/Superadmin
const createAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check if username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('Username already exists');
    }

    // Create a new user with 'admin' role
    const admin = await User.create({
        username,
        password: await bcrypt.hash(password, 10),
        role: 'admin',
        profileCompleted: true, // Admin profile can be predefined as complete
    });

    if (admin) {
        res.status(201).json({ message: 'Admin created successfully' });
    } else {
        res.status(400);
        throw new Error('Invalid data, admin could not be created');
    }
});

export { createAdmin }; 