/**
 * Authentication Middleware
 * Handles JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user or admin based on role
        if (decoded.role === 'admin' || decoded.role === 'superadmin') {
            const admin = await Admin.findById(decoded.id);
            if (!admin || !admin.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found or account is inactive'
                });
            }
            req.user = admin;
            req.userRole = decoded.role;
        } else {
            const user = await User.findById(decoded.id);
            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or account is inactive'
                });
            }
            req.user = user;
            req.userRole = 'user';
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }
};

/**
 * Admin only access
 */
const adminOnly = (req, res, next) => {
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

/**
 * Super admin only access
 */
const superAdminOnly = (req, res, next) => {
    if (req.userRole !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super admin privileges required.'
        });
    }
    next();
};

/**
 * Check specific permission
 * @param {String} permission - Permission key to check
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (req.userRole === 'superadmin') {
            return next(); // Superadmin has all permissions
        }

        if (req.userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        if (!req.user.permissions || !req.user.permissions[permission]) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Missing permission: ${permission}`
            });
        }

        next();
    };
};

/**
 * Optional auth - Attach user if token exists, but don't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.role === 'admin' || decoded.role === 'superadmin') {
                req.user = await Admin.findById(decoded.id);
            } else {
                req.user = await User.findById(decoded.id);
            }
            req.userRole = decoded.role;
        }

        next();
    } catch (error) {
        // Continue without user attached
        next();
    }
};

module.exports = {
    protect,
    adminOnly,
    superAdminOnly,
    checkPermission,
    optionalAuth
};
