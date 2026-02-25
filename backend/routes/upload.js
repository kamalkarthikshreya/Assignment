/**
 * Upload Route (Protected - requires JWT)
 * POST /api/upload - Upload CSV/XLSX and distribute items equally among agents
 *
 * Distribution logic:
 *   - Divide total rows by number of agents (5 by default)
 *   - Remaining rows are assigned sequentially to the first N agents
 *   - Example: 27 rows, 5 agents → agents 0,1 get 6 items; agents 2,3,4 get 5 items
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const Agent = require('../models/Agent');
const TaskList = require('../models/TaskList');
const { protect } = require('../middleware/auth');

// ---- Multer configuration: store in memory, validate file type ----
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(
            new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

/**
 * Distribute an array of items as evenly as possible among N agents.
 * Extra items (remainder) are assigned sequentially from index 0.
 *
 * @param {Array}  items      - Rows parsed from the uploaded file
 * @param {number} agentCount - Number of agents to distribute among
 * @returns {Array[]} Array of sub-arrays, one per agent
 */
const distributeItems = (items, agentCount) => {
    const baseCount = Math.floor(items.length / agentCount); // items per agent
    const remainder = items.length % agentCount;              // extra items

    const distributed = [];
    let index = 0;

    for (let i = 0; i < agentCount; i++) {
        // Agents with index < remainder get one extra item
        const count = baseCount + (i < remainder ? 1 : 0);
        distributed.push(items.slice(index, index + count));
        index += count;
    }

    return distributed;
};

/**
 * @route   POST /api/upload
 * @desc    Upload a CSV/XLSX file and distribute tasks among all agents
 * @access  Protected
 */
router.post('/', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file (CSV, XLSX, or XLS)',
            });
        }

        // ---- Parse the uploaded file using xlsx library ----
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawData || rawData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'The uploaded file is empty or has no valid data rows',
            });
        }

        // ---- Validate columns: must have FirstName, Phone, Notes ----
        const firstRow = rawData[0];
        const requiredColumns = ['FirstName', 'Phone', 'Notes'];
        const hasAllColumns = requiredColumns.every((col) =>
            Object.keys(firstRow).some(
                (key) => key.trim().toLowerCase() === col.toLowerCase()
            )
        );

        if (!hasAllColumns) {
            return res.status(400).json({
                success: false,
                message: `Invalid CSV format. Required columns: ${requiredColumns.join(', ')}`,
            });
        }

        // ---- Normalize data (handle case differences in column names) ----
        const normalizedData = rawData.map((row, idx) => {
            const keys = Object.keys(row);
            const find = (name) =>
                keys.find((k) => k.trim().toLowerCase() === name.toLowerCase());

            const firstName = row[find('FirstName')]?.toString().trim();
            const phone = row[find('Phone')];
            const notes = row[find('Notes')]?.toString().trim() || '';

            // Validate phone is a number
            if (!firstName) {
                throw new Error(`Row ${idx + 2}: FirstName cannot be empty`);
            }
            if (isNaN(phone) || phone === '') {
                throw new Error(`Row ${idx + 2}: Phone must be a valid number`);
            }

            return { firstName, phone: Number(phone), notes };
        });

        // ---- Fetch all agents ----
        const agents = await Agent.find().select('-password');
        if (agents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No agents found. Please add agents before uploading.',
            });
        }

        // ---- Distribute items equally ----
        const distributions = distributeItems(normalizedData, agents.length);

        // ---- Create unique batch ID for this upload ----
        const uploadBatch = `batch_${Date.now()}`;

        // ---- Save each agent's items to DB ----
        const savedLists = await Promise.all(
            agents.map((agent, i) =>
                TaskList.create({
                    agent: agent._id,
                    items: distributions[i],
                    uploadBatch,
                })
            )
        );

        // ---- Build response with agent details ----
        const result = savedLists.map((list, i) => ({
            agent: {
                id: agents[i]._id,
                name: agents[i].name,
                email: agents[i].email,
            },
            itemCount: list.items.length,
            items: list.items,
        }));

        res.status(201).json({
            success: true,
            message: `Successfully distributed ${normalizedData.length} items among ${agents.length} agents`,
            totalItems: normalizedData.length,
            agentCount: agents.length,
            uploadBatch,
            distribution: result,
        });
    } catch (error) {
        console.error('Upload error:', error);

        // Handle multer file type error
        if (error.message && error.message.includes('Invalid file type')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Server error during file upload',
        });
    }
});

// Handle multer errors (also catches file filter errors)
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
});

module.exports = router;
