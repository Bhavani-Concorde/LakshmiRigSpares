const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const updateAdmin = async () => {
    try {
        await connectDB();

        const oldEmail = 'admin@slrs.com';
        const newEmail = 'srilakshmirigspares2788@gmail.com';
        const newPassword = 'Admin@123';

        let admin = await Admin.findOne({ email: oldEmail });
        if (admin) {
            admin.email = newEmail;
            admin.password = newPassword;
            await admin.save();
            console.log('✅ Admin updated successfully.');
        } else {
            console.log('❌ Admin not found by old email.');
            // Maybe check if it's already updated?
            admin = await Admin.findOne({ email: newEmail });
            if (admin) {
                admin.password = newPassword;
                await admin.save();
                console.log('✅ Admin found by new email, password updated.');
            } else {
                console.log('❌ No admin found at all. Run seedAdmin.js to create one.');
            }
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

updateAdmin();
