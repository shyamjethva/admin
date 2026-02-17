import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
    {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        employeeName: { type: String, required: true },
        month: { type: String, required: true }, // "2026-02"
        basicSalary: { type: Number, required: true, default: 0 },
        allowances: { type: Number, required: true, default: 0 },
        deductions: { type: Number, required: true, default: 0 },
        netSalary: { type: Number, required: true, default: 0 },
        status: { type: String, enum: ["pending", "processed", "paid"], default: "pending" },
    },
    { timestamps: true }
);

// prevent duplicate payroll for same employee + month
payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export default mongoose.model("Payroll", payrollSchema);
