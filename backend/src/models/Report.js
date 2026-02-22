import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: ['attendance', 'leave', 'payroll', 'employee', 'recruitment']
    },
    fileName: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    recordCount: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    filters: {
        type: mongoose.Schema.Types.Mixed
    }
});

export default mongoose.model('Report', reportSchema);