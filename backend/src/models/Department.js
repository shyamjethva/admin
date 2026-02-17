import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        description: { type: String, trim: true },

        headOfDepartment: { type: String, required: true },
        employeeCount: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
