const express = require('express');
const router = express.Router();
const TaskList = require('../models/TaskList');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const lists = await TaskList.find()
            .populate('agent', 'name email mobile')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: lists.length, lists });
    } catch (error) {
        console.error('Get lists error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching lists' });
    }
});

router.get('/agent/:agentId', async (req, res) => {
    try {
        const lists = await TaskList.find({ agent: req.params.agentId })
            .populate('agent', 'name email mobile')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: lists.length, lists });
    } catch (error) {
        console.error('Get agent lists error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching agent lists' });
    }
});

module.exports = router;
