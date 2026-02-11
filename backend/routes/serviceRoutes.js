/**
 * Service Routes
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly, checkPermission } = require('../middleware/authMiddleware');
const {
    getServices,
    getService,
    getServiceBySlug,
    createService,
    updateService,
    deleteService,
    getAdminServices,
    getServiceCategories
} = require('../controllers/serviceController');

// Public routes
router.get('/', getServices);
router.get('/categories', getServiceCategories);
router.get('/slug/:slug', getServiceBySlug);
router.get('/:id', getService);

// Admin routes
router.post('/', protect, adminOnly, checkPermission('manageServices'), createService);
router.put('/:id', protect, adminOnly, checkPermission('manageServices'), updateService);
router.delete('/:id', protect, adminOnly, checkPermission('manageServices'), deleteService);
router.get('/admin/all', protect, adminOnly, checkPermission('manageServices'), getAdminServices);

module.exports = router;
