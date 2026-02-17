import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    profileImage: String, // Profile image URL (base64)

    // ✅ FIX: default + required
    code: {
        type: String,
        unique: true,
        required: true,
        default: () => `EMP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },

    designationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Designation",
        required: true,
    },

    joiningDate: String,
    salary: Number,
    status: { type: String, default: "active" },
});

// (optional) middleware rakhna ho to rakh lo, but default already enough
export default mongoose.model("Employee", employeeSchema);
