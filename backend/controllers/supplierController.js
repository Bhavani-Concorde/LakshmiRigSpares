/**
 * Supplier Controller - Supplier management
 */

const Supplier = require('../models/Supplier');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all suppliers
const getSuppliers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { companyName: { $regex: req.query.search, $options: 'i' } }
        ];
    }
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.categories = req.query.category;

    const [suppliers, total] = await Promise.all([
        Supplier.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Supplier.countDocuments(query)
    ]);

    res.json({ success: true, data: { suppliers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Get single supplier
const getSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id).populate('products', 'name price category');
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
});

// Create supplier
const createSupplier = asyncHandler(async (req, res) => {
    req.body.createdBy = req.user._id;
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, message: 'Supplier created', data: supplier });
});

// Update supplier
const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier updated', data: supplier });
});

// Delete supplier
const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier deleted' });
});

// Update supplier status
const updateSupplierStatus = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Status updated', data: supplier });
});

// Get supplier stats
const getSupplierStats = asyncHandler(async (req, res) => {
    const stats = await Supplier.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const categoryStats = await Supplier.aggregate([
        { $unwind: '$categories' },
        { $group: { _id: '$categories', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data: { statusStats: stats, categoryStats } });
});

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier, updateSupplierStatus, getSupplierStats };
