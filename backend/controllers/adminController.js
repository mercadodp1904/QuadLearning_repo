import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';



// @desc    Update user account
// @route   PUT /api/admins/:id
// @access  Private (admin role)
const updateUserAccount = asyncHandler(async (req, res) => {
    const { name, role, password } = req.body;
    const { id } = req.params; // Get user ID from the URL

    // Check if the user making the request is an admin or superadmin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        res.status(403);
        throw new Error('Not authorized to update user accounts');
    }

    // Find the user to update
    const user = await User.findById(id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update user details
    user.username = name || user.username;

    // Update password if provided
    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        username: updatedUser.name,
    });
});

// @desc    Get list of students and teachers
// @route   GET /api/admins/users
// @access  Private (admin role)
const getUserList = asyncHandler(async (req, res) => {
    // Check if the user making the request is an admin or superadmin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        res.status(403);
        throw new Error('Not authorized to view user accounts');
    }

    // Retrieve list of students and teachers
    const students = await User.find({ role: 'student' });
    const teachers = await User.find({ role: 'teacher' });

    res.json({ students, teachers });
});

// Exporting functions
export { createAdmin, updateUserAccount, getUserList };