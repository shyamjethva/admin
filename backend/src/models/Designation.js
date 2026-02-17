import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },


        level: {
            type: String,
            required: true,
            enum: ["Entry", "Junior", "Mid", "Senior", "Lead", "Manager", "Director", "Executive"],
        },

        description: { type: String, required: true },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("Designation", designationSchema);
