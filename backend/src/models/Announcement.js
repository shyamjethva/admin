import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        type: {
            type: String,
            enum: ["general", "department", "hr", "event", "alert", "achievement", "policy"],
            default: "general"
        },
        department: { type: String, default: "" },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        audience: { type: String, enum: ["all", "hr", "employee"], default: "all" }
    },
    { timestamps: true }
);

export default mongoose.model("Announcement", schema);
