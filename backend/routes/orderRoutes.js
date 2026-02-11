/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly, checkPermission } = require('../middleware/authMiddleware');
const {
    createOrder,
    getUserOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
} = require('../controllers/orderController');

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', adminOnly, checkPermission('manageOrders'), getAllOrders);
router.put('/:id/status', adminOnly, checkPermission('manageOrders'), updateOrderStatus);

module.exports = router;
