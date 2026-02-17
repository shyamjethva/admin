import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
    {
        name: { type: String },
        size: { type: Number },
        type: { type: String },
        dataUrl: { type: String }, // ⚠️ big for large files, but OK for now (<=10MB)
    },
    { _id: false }
);

const ChatMessageSchema = new mongoose.Schema(
    {
        // matches your frontend payload
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        userRole: { type: String, enum: ["admin", "hr", "employee"], required: true },

        message: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now },

        // optional attachment
        file: { type: FileSchema, default: null },

        // optional: future use
        department: { type: String, default: "" },
        isPrivate: { type: Boolean, default: false },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

ChatMessageSchema.index({ timestamp: -1 });

export default mongoose.model("ChatMessage", ChatMessageSchema);
