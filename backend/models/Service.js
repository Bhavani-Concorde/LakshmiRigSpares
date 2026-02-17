/**
 * Service Model
 * Handles industrial services offered
 */

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: [200, 'Service name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Installation',
            'Maintenance',
            'Repair',
            'Inspection',
            'Consultation',
            'Training',
            'Emergency Service',
            'Annual Maintenance Contract',
            'Calibration',
            'Testing',
            'Drilling',
            'Other'
        ]
    },
    price: {
        type: Number,
        min: [0, 'Price cannot be negative']
    },
    priceType: {
        type: String,
        enum: ['fixed', 'hourly', 'daily', 'per_visit', 'quotation'],
        default: 'quotation'
    },
    currency: {
        type: String,
        default: 'INR'
    },
    duration: {
        value: { type: Number },
        unit: { type: String, enum: ['hours', 'days', 'weeks', 'months'] }
    },
    images: [{
        url: { type: String, required: true },
        alt: { type: String }
    }],
    features: [String],
    inclusions: [String],
    exclusions: [String],
    requirements: [String],
    tags: [String],
    availability: {
        type: String,
        enum: ['24/7', 'business_hours', 'weekdays', 'by_appointment'],
        default: 'business_hours'
    },
    serviceArea: [String], // Cities/regions covered
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    bookingsCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1, isFeatured: 1 });
serviceSchema.index({ slug: 1 });

// Generate slug before saving
serviceSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    }
    next();
});

// Include virtuals in JSON
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
