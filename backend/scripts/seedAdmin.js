/**
 * Admin Seed Script
 * Creates the default admin user if it doesn't already exist.
 *
 * Run with: node scripts/seedAdmin.js
 *           OR: npm run seed
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Check if admin already exists
        const existing = await User.findOne({ email: 'admin@example.com' });
        if (existing) {
            console.log('ℹ️  Admin user already exists. Skipping seed.');
            process.exit(0);
        }

        // Create admin user
        await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'Admin@123',
            role: 'admin',
        });

        console.log('✅ Admin user created successfully!');
        console.log('   Email:    admin@example.com');
        console.log('   Password: Admin@123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
