import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // keep roles in lowercase because route guards use: "admin", "hr", "employee"
    role: {
      type: String,
      enum: ["admin", "hr", "employee"],
      default: "employee",
    },
    employeeId: { type: String, default: null },

    // optional profile fields (used in UI)
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
