/**
 * Supplier Model
 * Handles supplier/vendor information
 */

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    supplierId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true,
        maxlength: [200, 'Name cannot exceed 200 characters']
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    alternatePhone: {
        type: String,
        trim: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    gstin: {
        type: String,
        trim: true,
        uppercase: true
    },
    pan: {
        type: String,
        trim: true,
        uppercase: true
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountType: {
            type: String,
            enum: ['savings', 'current']
        }
    },
    categories: [{
        type: String,
        enum: [
            'Rig Equipment',
            'Drilling Tools',
            'Safety Equipment',
            'Pipes & Fittings',
            'Valves',
            'Pumps',
            'Motors',
            'Electrical Components',
            'Hydraulic Parts',
            'Spare Parts',
            'Consumables',
            'Other'
        ]
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    paymentTerms: {
        type: String,
        enum: ['immediate', 'net15', 'net30', 'net45', 'net60', 'credit'],
        default: 'net30'
    },
    creditLimit: {
        type: Number,
        default: 0
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blacklisted', 'pending_verification'],
        default: 'active'
    },
    notes: String,
    documents: [{
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    contactPersons: [{
        name: { type: String, required: true },
        designation: String,
        phone: String,
        email: String,
        isPrimary: { type: Boolean, default: false }
    }],
    orderHistory: {
        totalOrders: { type: Number, default: 0 },
        totalValue: { type: Number, default: 0 },
        lastOrderDate: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes
supplierSchema.index({ name: 'text', companyName: 'text' });
supplierSchema.index({ email: 1 });
supplierSchema.index({ supplierId: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ categories: 1 });

// Generate supplier ID before saving
supplierSchema.pre('save', async function (next) {
    if (!this.supplierId) {
        const count = await mongoose.model('Supplier').countDocuments();
        this.supplierId = `SUP${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
