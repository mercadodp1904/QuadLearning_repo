import asyncHandler from 'express-async-handler';  
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user/set token
// route    POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if(user && (await user.matchPassword(password))) {
        generateToken(res, user._id)
        res.status(201).json({
            _id: user._id,
            username: user.username,
            
        })
    } else {
        res.status(400)
        throw new Error('Invalid email or password');
    }
});



// @desc    Logout user
// route    POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({message: 'Logout User'});
});

// @desc    Get user profile
// route    GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        lrn: req.user.lrn
    }
    res.status(200).json({ user });
});

// @desc    Update user profile
// route    PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if(user) {
        user.name = req.body.name || user.lrn;
        user.name = req.body.name || user.name; 
    } else {
        res.status(404);
        throw new Error('User Not Found');
    }

    res.status(200).json({message: 'Update User Profile'});
});

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

    
});

export {
    authUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
};