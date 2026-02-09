/**
 * Product Controller - CRUD operations for products
 */

const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Get all products with filtering, sorting, pagination
const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    // Search
    if (req.query.search) {
        query.$text = { $search: req.query.search };
    }

    // Category filter
    if (req.query.category) {
        query.category = req.query.category;
    }

    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Featured
    if (req.query.featured === 'true') {
        query.isFeatured = true;
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    else if (req.query.sort === 'price_desc') sort = { price: -1 };
    else if (req.query.sort === 'name') sort = { name: 1 };
    else if (req.query.sort === 'popular') sort = { views: -1 };

    const [products, total] = await Promise.all([
        Product.find(query).populate('supplier', 'name companyName').sort(sort).skip(skip).limit(limit),
        Product.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('supplier', 'name companyName email phone');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Increment views
    product.views += 1;
    await product.save();

    res.json({ success: true, data: product });
});

// Get product by slug
const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('supplier', 'name companyName');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.views += 1;
    await product.save();

    res.json({ success: true, data: product });
});

// Create product (Admin)
const createProduct = asyncHandler(async (req, res) => {
    req.body.createdBy = req.user._id;
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: 'Product created', data: product });
});

// Update product (Admin)
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated', data: product });
});

// Delete product (Admin)
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
});

// Get all products (Admin - including inactive)
const getAdminProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };
    if (req.query.category) query.category = req.query.category;
    if (req.query.status === 'active') query.isActive = true;
    else if (req.query.status === 'inactive') query.isActive = false;

    const [products, total] = await Promise.all([
        Product.find(query).populate('supplier', 'name companyName').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Product.countDocuments(query)
    ]);

    res.json({ success: true, data: { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Get categories
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories });
});

module.exports = { getProducts, getProduct, getProductBySlug, createProduct, updateProduct, deleteProduct, getAdminProducts, getCategories };
