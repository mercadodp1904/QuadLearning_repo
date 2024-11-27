import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'

const protect = async (req, res, next) => {
    let token;
 const authHeader = req.headers.authorization; // Get the Authorization header
    // console.log('Authorization Header:', authHeader); // Log the header for debugging
    // Check if token is in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID
            req.user = await User.findById(decoded.id).select('-password'); // Exclude password

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorizeRoles = (...roles) => (req, res, next) => {
    if (req.user.role === 'superadmin' || roles.includes(req.user.role)) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized for this action');
    }
};

export { protect, authorizeRoles }