/**
 * Order Model
 * Handles customer orders for products
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 18 // GST percentage
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    discountCode: String,
    total: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded',
            'on_hold'
        ],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'credit'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentDetails: {
        transactionId: String,
        paidAmount: Number,
        paidAt: Date,
        bankReference: String
    },
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,
        company: String,
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    billingAddress: {
        name: String,
        phone: String,
        company: String,
        gstin: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    },
    shipping: {
        method: String,
        trackingNumber: String,
        carrier: String,
        estimatedDelivery: Date,
        shippedAt: Date,
        deliveredAt: Date
    },
    notes: String,
    internalNotes: String,
    history: [{
        status: String,
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'history.updatedByModel'
        },
        updatedByModel: {
            type: String,
            enum: ['User', 'Admin']
        },
        updatedAt: { type: Date, default: Date.now }
    }],
    fromEnquiry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enquiry'
    },
    invoiceNumber: String,
    invoiceUrl: String
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order ID before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        this.orderId = `ORD${year}${month}${String(count + 1).padStart(5, '0')}`;
    }

    // Add to history on status change
    if (this.isModified('status')) {
        this.history.push({
            status: this.status,
            note: `Order status changed to ${this.status}`,
            updatedAt: new Date()
        });
    }

    next();
});

// Virtual for item count
orderSchema.virtual('itemCount').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Include virtuals
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
