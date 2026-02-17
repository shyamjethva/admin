import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        weekStart: { type: String, required: true }, // "YYYY-MM-DD"
        items: [{ title: String, status: { type: String, default: "pending" } }]
    },
    { timestamps: true }
);

schema.index({ employeeId: 1, weekStart: 1 }, { unique: true });

export default mongoose.model("WeeklyPlan", schema);
