/**
 * Enquiry Routes
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly, checkPermission, optionalAuth } = require('../middleware/authMiddleware');
const {
    createEnquiry,
    getUserEnquiries,
    getEnquiry,
    respondToEnquiry,
    updateEnquiryStatus,
    getAllEnquiries,
    deleteEnquiry
} = require('../controllers/enquiryController');

// Public route (optional auth for logged-in users)
router.post('/', optionalAuth, createEnquiry);

// Protected user routes
router.get('/my-enquiries', protect, getUserEnquiries);
router.get('/:id', protect, getEnquiry);

// Admin routes
router.get('/', protect, adminOnly, checkPermission('manageEnquiries'), getAllEnquiries);
router.post('/:id/respond', protect, adminOnly, checkPermission('manageEnquiries'), respondToEnquiry);
router.put('/:id/status', protect, adminOnly, checkPermission('manageEnquiries'), updateEnquiryStatus);
router.delete('/:id', protect, adminOnly, checkPermission('manageEnquiries'), deleteEnquiry);

module.exports = router;
