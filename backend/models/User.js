/**
 * User Model
 * Handles customer/user accounts with local and Google OAuth support
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        trim: true,
        maxlength: [15, 'Phone number cannot exceed 15 characters']
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        country: { type: String, trim: true, default: 'India' }
    },
    company: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (exclude sensitive data)
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        address: this.address,
        company: this.company,
        avatar: this.avatar,
        role: this.role,
        authProvider: this.authProvider,
        isVerified: this.isVerified,
        createdAt: this.createdAt
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
