/**
 * Agent Model
 * Fields: name, email, mobile (with country code), password
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AgentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Agent name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        mobile: {
            type: String,
            required: [true, 'Mobile number is required'],
            // Stores with country code, e.g. "+91 9876543210"
            match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid mobile number with country code'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
    },
    { timestamps: true }
);

// Hash password before saving
AgentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('Agent', AgentSchema);
