import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        description: { type: String, default: "" },

        maxDays: { type: Number, default: 0 },

        isPaid: { type: Boolean, default: true },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
);

const LeaveType = mongoose.model("LeaveType", leaveTypeSchema);

export default LeaveType;   // ✅ IMPORTANT
