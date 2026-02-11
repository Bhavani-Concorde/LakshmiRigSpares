/**
 * Booking Routes
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly, checkPermission } = require('../middleware/authMiddleware');
const {
    createBooking,
    getUserBookings,
    getBooking,
    updateBookingStatus,
    cancelBooking,
    getAllBookings,
    addFeedback
} = require('../controllers/bookingController');

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/:id', getBooking);
router.post('/:id/cancel', cancelBooking);
router.post('/:id/feedback', addFeedback);

// Admin routes
router.get('/', adminOnly, checkPermission('manageBookings'), getAllBookings);
router.put('/:id/status', adminOnly, checkPermission('manageBookings'), updateBookingStatus);

module.exports = router;
