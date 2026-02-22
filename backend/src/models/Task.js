import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },

        dueDate: { type: Date, default: null },
        category: { type: String, default: "General" },

        // ✅ timer fields
        timeSpent: { type: Number, default: 0 }, // seconds
        isRunning: { type: Boolean, default: false },
        timerStartTime: { type: Date, default: null },
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
