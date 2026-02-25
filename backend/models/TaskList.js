const mongoose = require('mongoose');

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
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: true,
        },
        items: [TaskItemSchema],
        uploadBatch: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('TaskList', TaskListSchema);
