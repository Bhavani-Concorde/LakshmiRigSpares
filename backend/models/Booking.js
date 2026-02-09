/**
 * Booking Model
 * Handles service bookings from customers
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Service is required']
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },
    scheduledTime: {
        type: String,
        required: [true, 'Scheduled time is required']
    },
    endDate: Date,
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'in_progress',
            'completed',
            'cancelled',
            'rescheduled'
        ],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        pincode: { type: String },
        landmark: { type: String },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    contactPerson: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String }
    },
    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    requirements: [String],
    estimatedPrice: {
        type: Number,
        min: 0
    },
    finalPrice: {
        type: Number,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
    },
    assignedTechnician: {
        name: String,
        phone: String,
        email: String
    },
    notes: [{
        text: String,
        addedBy: String,
        addedAt: { type: Date, default: Date.now }
    }],
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        submittedAt: Date
    },
    cancellationReason: String,
    completedAt: Date
}, {
    timestamps: true
});

// Indexes
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ status: 1 });

// Generate booking ID before saving
bookingSchema.pre('save', async function (next) {
    if (!this.bookingId) {
        const count = await mongoose.model('Booking').countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        this.bookingId = `BK${year}${month}${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Virtual for booking age
bookingSchema.virtual('age').get(function () {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Include virtuals
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
