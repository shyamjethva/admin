import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["public", "optional"],
            default: "public",
        },
        date: { type: Date, required: true },
        description: { type: String, trim: true },
        department: { type: String, trim: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export default mongoose.model("Holiday", HolidaySchema);
