const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Remove colors dependency
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

// Load env vars
// Path is relative to CWD, which should be backend root
dotenv.config({ path: './.env' });

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@slrs.com';
        const adminPassword = 'Admin@12345';

        // Check if admin exists
        let adminExists = await Admin.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists.');
            console.log(`Email: ${adminEmail}`);

            // Check if password works or reset it
            // Since we can't check hashed password without bcrypt compare, 
            // and we want to ensure user can login, let's reset it.
            adminExists.password = adminPassword;
            await adminExists.save();
            console.log(`Password reset to: ${adminPassword}`);
        } else {
            // Create admin
            await Admin.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'superadmin',
                phone: '9876543210',
                permissions: {
                    manageProducts: true,
                    manageServices: true,
                    manageUsers: true,
                    manageOrders: true,
                    manageBookings: true,
                    manageEnquiries: true,
                    manageSuppliers: true,
                    viewReports: true,
                    manageAdmins: true
                }
            });
            console.log('Admin user created successfully');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
