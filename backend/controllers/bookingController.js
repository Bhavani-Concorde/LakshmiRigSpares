/**
 * Booking Controller - Service booking management
 */

const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { sendBookingConfirmation } = require('../utils/emailService');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Create a new booking
const createBooking = asyncHandler(async (req, res) => {
    const { service, scheduledDate, scheduledTime, location, contactPerson, description, requirements, priority } = req.body;

    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) return res.status(404).json({ success: false, message: 'Service not found' });

    const booking = await Booking.create({
        user: req.user._id,
        service,
        scheduledDate,
        scheduledTime,
        location,
        contactPerson,
        description,
        requirements,
        priority: priority || 'normal'
    });

    // Increment service bookings count
    serviceDoc.bookingsCount += 1;
    await serviceDoc.save();

    // Send confirmation email
    sendBookingConfirmation(req.user, booking, serviceDoc).catch(err => console.error('Booking email failed:', err));

    const populatedBooking = await Booking.findById(booking._id).populate('service', 'name category');
    res.status(201).json({ success: true, message: 'Booking created successfully', data: populatedBooking });
});

// Get user bookings
const getUserBookings = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (req.query.status) query.status = req.query.status;

    const [bookings, total] = await Promise.all([
        Booking.find(query).populate('service', 'name category').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Booking.countDocuments(query)
    ]);

    res.json({ success: true, data: { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Get single booking
const getBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('service').populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Check ownership (user) or admin
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin' && booking.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: booking });
});

// Update booking status (Admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status, assignedTechnician, estimatedPrice, notes } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (status) booking.status = status;
    if (assignedTechnician) booking.assignedTechnician = assignedTechnician;
    if (estimatedPrice) booking.estimatedPrice = estimatedPrice;
    if (notes) booking.notes.push({ text: notes, addedBy: req.user.name, addedAt: new Date() });
    if (status === 'completed') booking.completedAt = new Date();

    await booking.save();
    const updated = await Booking.findById(booking._id).populate('service', 'name').populate('user', 'name email');

    res.json({ success: true, message: 'Booking updated', data: updated });
});

// Cancel booking
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Check ownership or admin
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin' && booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
        return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', data: booking });
});

// Get all bookings (Admin)
const getAllBookings = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.date) query.scheduledDate = { $gte: new Date(req.query.date), $lt: new Date(new Date(req.query.date).getTime() + 86400000) };

    const [bookings, total] = await Promise.all([
        Booking.find(query).populate('service', 'name category').populate('user', 'name email phone').sort({ scheduledDate: 1 }).skip(skip).limit(limit),
        Booking.countDocuments(query)
    ]);

    res.json({ success: true, data: { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

// Add feedback
const addFeedback = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed bookings' });

    booking.feedback = { rating, comment, submittedAt: new Date() };
    await booking.save();

    // Update service rating
    const service = await Service.findById(booking.service);
    if (service) {
        const newCount = service.rating.count + 1;
        const newAvg = ((service.rating.average * service.rating.count) + rating) / newCount;
        service.rating = { average: Math.round(newAvg * 10) / 10, count: newCount };
        await service.save();
    }

    res.json({ success: true, message: 'Feedback submitted', data: booking });
});

module.exports = { createBooking, getUserBookings, getBooking, updateBookingStatus, cancelBooking, getAllBookings, addFeedback };
