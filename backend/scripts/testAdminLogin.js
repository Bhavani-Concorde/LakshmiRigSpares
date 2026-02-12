const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const testAdminLogin = async () => {
    try {
        await connectDB();
        console.log('Testing Admin Login...');

        const email = 'admin@slrs.com';
        const password = 'Admin@12345';

        const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

        if (!admin) {
            console.log('❌ Admin user not found with email:', email);
            process.exit(1);
        }

        if (admin.isLocked) {
            console.log('❌ Account is locked until:', admin.lockUntil);
            process.exit(1);
        }

        if (!admin.isActive) {
            console.log('❌ Account is deactivated');
            process.exit(1);
        }

        const isMatch = await admin.comparePassword(password);

        if (isMatch) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('Credentials are valid.');
        } else {
            console.log('❌ PASSWORD MISMATCH');
            console.log('The password in the database does NOT match "Admin@12345".');

            // Should we reset it?
            console.log('Resetting password to ensure it works...');
            admin.password = password;
            // Clear any locks
            admin.loginAttempts = 0;
            admin.lockUntil = undefined;
            await admin.save();
            console.log('✅ Password has been reset to "Admin@12345". Try logging in now.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testAdminLogin();
