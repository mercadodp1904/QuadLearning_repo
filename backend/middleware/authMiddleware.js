import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'

const protect = asyncHandler(async (req, res, next) => {
    let token;
    token = req.cookies.jwt

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.userId).select('-password');

            next();
        } catch (error) {
            res.status(401)
            throw new Error('Not Authorized, Invalid Token');
        }

    } else {
        res.status(401);
        throw new Error('Not Authorized, No Token');
    }
});

const authorizeRoles = (...roles) => (req, res, next) => {
    if (req.user.role === 'superadmin' || roles.includes(req.user.role)) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized for this action');
    }
};

export { protect, authorizeRoles }