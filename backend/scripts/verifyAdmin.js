const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const checkAdmin = async () => {
    try {
        await connectDB();
        const adminEmail = 'admin@slrs.com';
        const admin = await Admin.findOne({ email: adminEmail }).select('+password');

        if (admin) {
            console.log('✅ Admin found');
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('Is Active:', admin.isActive);
            console.log('Permissions:', admin.permissions);
            // We can't verify password match easily here without the plain text, 
            // but we know we just set it.
        } else {
            console.log('❌ Admin NOT found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkAdmin();
