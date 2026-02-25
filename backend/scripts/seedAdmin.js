const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        const existing = await User.findOne({ email: 'admin@example.com' });
        if (existing) {
            console.log('ℹ️  Admin user already exists. Skipping seed.');
            process.exit(0);
        }

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
