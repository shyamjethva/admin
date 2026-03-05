import mongoose from "mongoose";

const BirthdaySchema = new mongoose.Schema(
    {
        employeeName: { type: String, required: true, trim: true },
        department: { type: String, trim: true },
        date: { type: Date, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional user reference
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export default mongoose.model("Birthday", BirthdaySchema);
