import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        startTime: { type: String, required: true }, // "09:00"
        endTime: { type: String, required: true }    // "18:00"
    },
    { timestamps: true }
);

export default mongoose.model("Shift", schema);
