/**
 * Lists Routes (Protected - requires JWT)
 * GET /api/lists            - Get all distributed task lists
 * GET /api/lists/:agentId   - Get task lists for a specific agent
 */

const express = require('express');
const router = express.Router();
const TaskList = require('../models/TaskList');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @route   GET /api/lists
 * @desc    Fetch all distributed task lists, grouped by agent
 * @access  Protected
 */
router.get('/', async (req, res) => {
    try {
        const lists = await TaskList.find()
            .populate('agent', 'name email mobile')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: lists.length,
            lists,
        });
    } catch (error) {
        console.error('Get lists error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching lists' });
    }
});

/**
 * @route   GET /api/lists/agent/:agentId
 * @desc    Fetch task lists for a specific agent
 * @access  Protected
 */
router.get('/agent/:agentId', async (req, res) => {
    try {
        const lists = await TaskList.find({ agent: req.params.agentId })
            .populate('agent', 'name email mobile')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: lists.length,
            lists,
        });
    } catch (error) {
        console.error('Get agent lists error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching agent lists' });
    }
});

module.exports = router;
