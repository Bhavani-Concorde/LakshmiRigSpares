/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly, checkPermission } = require('../middleware/authMiddleware');
const {
    getProducts,
    getProduct,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminProducts,
    getCategories
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, adminOnly, checkPermission('manageProducts'), createProduct);
router.put('/:id', protect, adminOnly, checkPermission('manageProducts'), updateProduct);
router.delete('/:id', protect, adminOnly, checkPermission('manageProducts'), deleteProduct);
router.get('/admin/all', protect, adminOnly, checkPermission('manageProducts'), getAdminProducts);

module.exports = router;
