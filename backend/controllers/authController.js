/**
 * Authentication Controller
 * Handles user registration, login, Google OAuth, and profile management
 */

const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/generateToken');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, company } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email and password'
        });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Email is already registered'
        });
    }

    // Create user instance (don't save to DB yet)
    const user = new User({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        company,
        authProvider: 'local'
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user, 'user');

    // Save refresh token to user
    user.refreshToken = refreshToken;

    // Save user (this will hash the password once)
    await user.save();

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));

    // Set cookies
    res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: user.toPublicJSON(),
            token: accessToken
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Find user with password
    console.log(`Login attempt for email: ${email.toLowerCase()}`);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        console.log(`Login failed: User not found for email ${email.toLowerCase()}`);
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if user registered with Google
    if (user.authProvider === 'google' && !user.password) {
        console.log(`Login failed: Google account for email ${email.toLowerCase()}`);
        return res.status(401).json({
            success: false,
            message: 'This account uses Google login. Please sign in with Google.'
        });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log(`Password match for ${email.toLowerCase()}: ${isMatch}`);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if account is active
    if (!user.isActive) {
        console.log(`Login failed: Account inactive for ${email.toLowerCase()}`);
        return res.status(401).json({
            success: false,
            message: 'Your account has been deactivated. Please contact support.'
        });
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user, 'user');
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: user.toPublicJSON(),
            token: accessToken
        }
    });
});

/**
 * @desc    Google OAuth login/register (Legacy - Disabled)
 * @route   POST /api/auth/google
 * @access  Public
 */
const clerkSync = (req, res) => {
    res.status(410).json({ success: false, message: 'Clerk integration has been removed.' });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.json({
        success: true,
        data: user.toPublicJSON()
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, company, address } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user.toPublicJSON()
    });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Please provide current and new password'
        });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password updated successfully'
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    // Clear refresh token in database
    if (req.user) {
        req.user.refreshToken = undefined;
        await req.user.save();
    }

    // Clear cookies
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: 'No refresh token provided'
        });
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user, 'user');

        // Save new refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        // Set cookies
        res.cookie('token', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            token: tokens.accessToken
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
});

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        // Don't reveal if email exists
        return res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent'
        });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send email
    try {
        await sendPasswordResetEmail(user, resetToken);
        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500).json({
            success: false,
            message: 'Email could not be sent'
        });
    }
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successful'
    });
});

module.exports = {
    registerUser,
    loginUser,
    clerkSync,
    getProfile,
    updateProfile,
    updatePassword,
    logout,
    refreshAccessToken,
    forgotPassword,
    resetPassword
};
