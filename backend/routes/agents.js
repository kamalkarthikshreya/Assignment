const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const agents = await Agent.find().select('-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            count: agents.length,
            agents,
        });
    } catch (error) {
        console.error('Get agents error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching agents' });
    }
});

router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Name is required').trim(),
        body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
        body('mobile')
            .notEmpty()
            .withMessage('Mobile number is required')
            .matches(/^\+?[1-9]\d{6,14}$/)
            .withMessage('Enter a valid mobile number with country code (e.g. +919876543210)'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array(),
            });
        }

        const { name, email, mobile, password } = req.body;

        try {
            const existingAgent = await Agent.findOne({ email });
            if (existingAgent) {
                return res.status(400).json({
                    success: false,
                    message: 'An agent with this email already exists',
                });
            }

            const agent = await Agent.create({ name, email, mobile, password });
            const agentData = await Agent.findById(agent._id).select('-password');
            res.status(201).json({
                success: true,
                message: 'Agent created successfully',
                agent: agentData,
            });
        } catch (error) {
            console.error('Create agent error:', error);
            res.status(500).json({ success: false, message: 'Server error creating agent' });
        }
    }
);

router.put(
    '/:id',
    [
        body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
        body('email').optional().isEmail().withMessage('Please enter a valid email'),
        body('mobile')
            .optional()
            .matches(/^\+?[1-9]\d{6,14}$/)
            .withMessage('Enter a valid mobile number with country code'),
        body('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array(),
            });
        }

        try {
            let agent = await Agent.findById(req.params.id);
            if (!agent) {
                return res.status(404).json({ success: false, message: 'Agent not found' });
            }

            const { name, email, mobile, password } = req.body;

            if (name) agent.name = name;
            if (email) agent.email = email;
            if (mobile) agent.mobile = mobile;
            if (password) agent.password = password;

            await agent.save();

            const updatedAgent = await Agent.findById(agent._id).select('-password');
            res.json({
                success: true,
                message: 'Agent updated successfully',
                agent: updatedAgent,
            });
        } catch (error) {
            console.error('Update agent error:', error);
            res.status(500).json({ success: false, message: 'Server error updating agent' });
        }
    }
);

router.delete('/:id', async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }

        await agent.deleteOne();
        res.json({ success: true, message: 'Agent deleted successfully' });
    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting agent' });
    }
});

module.exports = router;
