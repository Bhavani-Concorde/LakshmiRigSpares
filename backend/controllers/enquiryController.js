/**
 * Enquiry Controller - Product/Service enquiries management
 */

const Enquiry = require('../models/Enquiry');
const { sendEnquiryReceived } = require('../utils/emailService');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Create enquiry
const createEnquiry = asyncHandler(async (req, res) => {
    const { type, product, service, subject, message, quantity, preferredContactMethod, preferredContactTime } = req.body;

    const enquiryData = {
        type,
        subject,
        message,
        quantity,
        preferredContactMethod,
        preferredContactTime
    };

    if (req.user) {
        enquiryData.user = req.user._id;
    } else {
        enquiryData.guestInfo = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            company: req.body.company
        };
    }

    if (product) enquiryData.product = product;
    if (service) enquiryData.service = service;

    const enquiry = await Enquiry.create(enquiryData);

    // Send confirmation email
    const email = req.user ? req.user.email : req.body.email;
    const name = req.user ? req.user.name : req.body.name;
    sendEnquiryReceived(email, name, enquiry).catch(err => console.error('Enquiry email failed:', err));

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', data: enquiry });
});

// Get user enquiries
const getUserEnquiries = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;

    const [enquiries, total] = await Promise.all([
        Enquiry.find(query).populate('product', 'name').populate('service', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Enquiry.countDocuments(query)
    ]);

    res.json({ success: true, data: { enquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Get single enquiry
const getEnquiry = asyncHandler(async (req, res) => {
    const enquiry = await Enquiry.findById(req.params.id)
        .populate('product', 'name price images')
        .populate('service', 'name price')
        .populate('user', 'name email phone')
        .populate('responses.respondedBy', 'name');

    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    // Check access
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin' && enquiry.user && enquiry.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: enquiry });
});

// Respond to enquiry (Admin)
const respondToEnquiry = asyncHandler(async (req, res) => {
    const { message, isInternal } = req.body;

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    enquiry.responses.push({
        message,
        respondedBy: req.user._id,
        isInternal: isInternal || false
    });

    if (enquiry.status === 'new') enquiry.status = 'in_progress';
    if (!isInternal) enquiry.status = 'responded';

    await enquiry.save();
    const updated = await Enquiry.findById(enquiry._id).populate('responses.respondedBy', 'name');

    res.json({ success: true, message: 'Response added', data: updated });
});

// Update enquiry status (Admin)
const updateEnquiryStatus = asyncHandler(async (req, res) => {
    const { status, priority, assignedTo } = req.body;

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    if (status) {
        enquiry.status = status;
        if (status === 'closed') {
            enquiry.closedAt = new Date();
            enquiry.closedBy = req.user._id;
        }
    }
    if (priority) enquiry.priority = priority;
    if (assignedTo) enquiry.assignedTo = assignedTo;

    await enquiry.save();
    res.json({ success: true, message: 'Enquiry updated', data: enquiry });
});

// Get all enquiries (Admin)
const getAllEnquiries = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    if (req.query.priority) query.priority = req.query.priority;

    const [enquiries, total] = await Promise.all([
        Enquiry.find(query).populate('product', 'name').populate('service', 'name').populate('user', 'name email').populate('assignedTo', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Enquiry.countDocuments(query)
    ]);

    res.json({ success: true, data: { enquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Delete enquiry (Admin)
const deleteEnquiry = asyncHandler(async (req, res) => {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, message: 'Enquiry deleted' });
});

module.exports = { createEnquiry, getUserEnquiries, getEnquiry, respondToEnquiry, updateEnquiryStatus, getAllEnquiries, deleteEnquiry };
