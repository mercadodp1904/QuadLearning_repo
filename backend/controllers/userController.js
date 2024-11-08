import asyncHandler from 'express-async-handler';  
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// @desc    Auth user/set token
// route    POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check if user exists by username
    const user = await User.findOne({ username });
    if (!user) {
        //console.log('Invalid credentials attempt for:', username);
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        //console.log('Invalid credentials for username:', username);
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // If credentials are valid, create a token and set it in a cookie
    generateToken(user._id, res); // Pass the user ID to generateToken

    res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
    });
});

// @desc    Logout user
// route    POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logout User' });
});

export {
    logoutUser,
    authUser
};