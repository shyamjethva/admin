import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },

        type: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info",
        },

        // who will receive
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // single user
        roleTarget: {
            type: String,
            enum: ["admin", "hr", "employee", "all"],
            default: "all",
        },

        isRead: { type: Boolean, default: false },
        readAt: { type: Date },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        meta: { type: Object }, // optional extra (link, entityId, etc.)
    },
    { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
