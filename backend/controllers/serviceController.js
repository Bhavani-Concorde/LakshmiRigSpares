/**
 * Service Controller - CRUD operations for services
 */

const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all services
const getServices = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (req.query.search) query.$text = { $search: req.query.search };
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === 'true') query.isFeatured = true;

    let sort = { createdAt: -1 };
    if (req.query.sort === 'name') sort = { name: 1 };
    else if (req.query.sort === 'popular') sort = { bookingsCount: -1 };

    const [services, total] = await Promise.all([
        Service.find(query).sort(sort).skip(skip).limit(limit),
        Service.countDocuments(query)
    ]);

    res.json({ success: true, data: { services, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Get single service
const getService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
});

// Get service by slug
const getServiceBySlug = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
});

// Create service (Admin)
const createService = asyncHandler(async (req, res) => {
    req.body.createdBy = req.user._id;
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, message: 'Service created', data: service });
});

// Update service (Admin)
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service updated', data: service });
});

// Delete service (Admin)
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
});

// Get all services (Admin)
const getAdminServices = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };
    if (req.query.category) query.category = req.query.category;
    if (req.query.status === 'active') query.isActive = true;
    else if (req.query.status === 'inactive') query.isActive = false;

    const [services, total] = await Promise.all([
        Service.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Service.countDocuments(query)
    ]);

    res.json({ success: true, data: { services, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Get categories
const getServiceCategories = asyncHandler(async (req, res) => {
    const categories = await Service.distinct('category');
    res.json({ success: true, data: categories });
});

module.exports = { getServices, getService, getServiceBySlug, createService, updateService, deleteService, getAdminServices, getServiceCategories };
