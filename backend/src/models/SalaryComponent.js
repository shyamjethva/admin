import mongoose from "mongoose";

const salaryComponentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ["allowance", "deduction"], required: true },
        amount: { type: Number, required: true, default: 0 },
        isPercentage: { type: Boolean, default: false },
        description: { type: String, default: "" },
    },
    { timestamps: true }
);

// Optional: same name duplicates avoid
salaryComponentSchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.model("SalaryComponent", salaryComponentSchema);
