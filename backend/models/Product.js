/**
 * Product Model
 * Handles industrial products catalog
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
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
            'Critical Machined Items',
            'Other'
        ]
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    model: {
        type: String,
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR'
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    minOrderQuantity: {
        type: Number,
        default: 1,
        min: [1, 'Minimum order quantity must be at least 1']
    },
    unit: {
        type: String,
        default: 'piece',
        enum: ['piece', 'set', 'kg', 'meter', 'litre', 'box', 'dozen']
    },
    images: [{
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],
    specifications: [{
        key: { type: String, required: true },
        value: { type: String, required: true }
    }],
    features: [String],
    tags: [String],
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    warranty: {
        type: String,
        trim: true
    },
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
    views: {
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

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
// productSchema.index({ slug: 1 }); // Removed to avoid duplicate index warning

// Generate slug from name before saving
productSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    }
    next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.discountPrice && this.price > this.discountPrice) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

// Virtual for availability status
productSchema.virtual('availabilityStatus').get(function () {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock <= 5) return 'Low Stock';
    return 'In Stock';
});

// Include virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
