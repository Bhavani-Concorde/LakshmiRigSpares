/**
 * JWT Token Generation Utilities
 */

const jwt = require('jsonwebtoken');

/**
 * Generate Access Token
 * @param {Object} user - User or Admin object
 * @param {String} role - 'user' or 'admin'
 * @returns {String} JWT access token
 */
const generateAccessToken = (user, role = 'user') => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: role,
            name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

/**
 * Generate Refresh Token
 * @param {Object} user - User or Admin object
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Generate both tokens
 * @param {Object} user - User or Admin object
 * @param {String} role - 'user' or 'admin'
 * @returns {Object} Object containing accessToken and refreshToken
 */
const generateTokens = (user, role = 'user') => {
    return {
        accessToken: generateAccessToken(user, role),
        refreshToken: generateRefreshToken(user)
    };
};

/**
 * Verify Access Token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Verify Refresh Token
 * @param {String} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken
};
