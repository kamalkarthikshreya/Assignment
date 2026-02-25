/**
 * TaskList Model
 * Stores the distributed items assigned to each agent per upload batch
 */

const mongoose = require('mongoose');

// Individual item from the uploaded CSV/XLSX
const TaskItemSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
});

const TaskListSchema = new mongoose.Schema(
    {
        // Reference to the agent assigned these tasks
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: true,
        },
        // The list of items assigned to this agent
        items: [TaskItemSchema],
        // Batch identifier (timestamp of upload) to group uploads
        uploadBatch: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('TaskList', TaskListSchema);
