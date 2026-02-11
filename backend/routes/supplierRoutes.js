/**
 * Supplier Routes
 */

const express = require('express');
const router = express.Router();
const { protect, adminOnly, checkPermission } = require('../middleware/authMiddleware');
const {
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    updateSupplierStatus,
    getSupplierStats
} = require('../controllers/supplierController');

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);
router.use(checkPermission('manageSuppliers'));

router.get('/', getSuppliers);
router.get('/stats', getSupplierStats);
router.get('/:id', getSupplier);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.put('/:id/status', updateSupplierStatus);
router.delete('/:id', deleteSupplier);

module.exports = router;
