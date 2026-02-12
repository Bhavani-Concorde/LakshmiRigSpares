/**
 * Admin Controller
 * Handles admin authentication and management
 */

const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const { generateTokens } = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Admin login
const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

    if (!admin) {
        console.log(`Admin login failed: User ${email} not found`);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (admin.isLocked) {
        console.log(`Admin login failed: Account locked for ${email}`);
        return res.status(423).json({ success: false, message: 'Account is temporarily locked' });
    }

    if (!admin.isActive) {
        console.log(`Admin login failed: Account deactivated for ${email}`);
        return res.status(401).json({ success: false, message: 'Account deactivated' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        console.log(`Admin login failed: Password mismatch for ${email}`);
        await admin.incLoginAttempts();
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (admin.loginAttempts > 0) {
        await admin.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    }

    admin.lastLogin = new Date();
    const { accessToken, refreshToken } = generateTokens(admin, admin.role);
    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie('token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ success: true, message: 'Login successful', data: { admin: admin.toPublicJSON(), token: accessToken } });
});

// Get admin profile
const getAdminProfile = asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.user.toPublicJSON() });
});

// Update admin profile
const updateAdminProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const admin = await Admin.findById(req.user._id);
    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    await admin.save();
    res.json({ success: true, message: 'Profile updated', data: admin.toPublicJSON() });
});

// Get dashboard statistics
const getDashboardStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalUsers, totalProducts, totalServices, totalOrders, totalBookings, pendingEnquiries, monthlyOrders, recentOrders, recentEnquiries, recentBookings] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Service.countDocuments({ isActive: true }),
        Order.countDocuments(),
        Booking.countDocuments(),
        Enquiry.countDocuments({ status: 'new' }),
        Order.find({ createdAt: { $gte: thisMonth } }),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
        Enquiry.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
        Booking.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').populate('service', 'name')
    ]);

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    res.json({
        success: true,
        data: {
            overview: { totalUsers, totalProducts, totalServices, totalOrders, totalBookings, pendingEnquiries, monthlyRevenue },
            recentOrders, recentEnquiries, recentBookings
        }
    });
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};

    if (req.query.search) {
        query.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }];
    }
    if (req.query.status === 'active') query.isActive = true;
    else if (req.query.status === 'inactive') query.isActive = false;

    const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query)
    ]);

    res.json({ success: true, data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Update user status
const updateUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User ${req.body.isActive ? 'activated' : 'deactivated'}`, data: user });
});

// Create admin
const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, phone, permissions } = req.body;
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Admin already exists' });

    const admin = await Admin.create({ name, email: email.toLowerCase(), password, phone, permissions, role: 'admin' });
    res.status(201).json({ success: true, message: 'Admin created', data: admin.toPublicJSON() });
});

// Admin logout
const adminLogout = asyncHandler(async (req, res) => {
    if (req.user) { req.user.refreshToken = undefined; await req.user.save(); }
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
    res.json({ success: true, message: 'Logged out' });
});

module.exports = { adminLogin, getAdminProfile, updateAdminProfile, getDashboardStats, getAllUsers, updateUserStatus, createAdmin, adminLogout };
