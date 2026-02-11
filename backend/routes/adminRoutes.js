/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly, superAdminOnly, checkPermission } = require('../middleware/authMiddleware');
const {
    adminLogin,
    getAdminProfile,
    updateAdminProfile,
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    createAdmin,
    adminLogout
} = require('../controllers/adminController');

// Public route
router.post('/login', adminLogin);

// Protected admin routes
router.use(protect);
router.use(adminOnly);

router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.get('/dashboard', getDashboardStats);
router.post('/logout', adminLogout);

// User management
router.get('/users', checkPermission('manageUsers'), getAllUsers);
router.put('/users/:id/status', checkPermission('manageUsers'), updateUserStatus);

// Admin management (superadmin only)
router.post('/create', superAdminOnly, createAdmin);

module.exports = router;
