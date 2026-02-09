/**
 * Enquiry Model
 * Handles product and service enquiries from customers
 */

const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    enquiryId: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // For non-registered users
    guestInfo: {
        name: String,
        email: String,
        phone: String,
        company: String
    },
    type: {
        type: String,
        enum: ['product', 'service', 'general', 'quote', 'support'],
        required: [true, 'Enquiry type is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    quantity: {
        type: Number,
        min: 1
    },
    preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'whatsapp', 'any'],
        default: 'any'
    },
    preferredContactTime: String,
    status: {
        type: String,
        enum: ['new', 'in_progress', 'responded', 'closed', 'spam'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    responses: [{
        message: { type: String, required: true },
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        respondedAt: { type: Date, default: Date.now },
        isInternal: { type: Boolean, default: false } // Internal notes
    }],
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    source: {
        type: String,
        enum: ['website', 'phone', 'email', 'referral', 'walk-in', 'other'],
        default: 'website'
    },
    convertedToOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    closedAt: Date,
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
enquirySchema.index({ user: 1, status: 1 });
enquirySchema.index({ product: 1 });
enquirySchema.index({ service: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ enquiryId: 1 });
enquirySchema.index({ type: 1 });

// Generate enquiry ID before saving
enquirySchema.pre('save', async function (next) {
    if (!this.enquiryId) {
        const count = await mongoose.model('Enquiry').countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        this.enquiryId = `ENQ${year}${month}${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Virtual for response time
enquirySchema.virtual('responseTime').get(function () {
    if (this.responses && this.responses.length > 0) {
        const firstResponse = this.responses[0].respondedAt;
        return firstResponse - this.createdAt;
    }
    return null;
});

// Include virtuals
enquirySchema.set('toJSON', { virtuals: true });
enquirySchema.set('toObject', { virtuals: true });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
