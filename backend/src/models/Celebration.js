import mongoose from "mongoose";

const CelebrationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true }, // e.g. "Birthday - Raj"
        type: {
            type: String,
            enum: ["birthday", "anniversary", "holiday", "custom"],
            default: "custom",
        },

        date: { type: Date, required: true }, // main celebration date
        description: { type: String, trim: true },

        // optional: relate to employee/user
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        // employee details
        employeeName: { type: String, trim: true },
        department: { type: String, trim: true },
        yearsCompleted: { type: Number, default: 1 },
        joinDate: { type: Date },

        // for UI visibility
        isActive: { type: Boolean, default: true },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export default mongoose.model("Celebration", CelebrationSchema);
