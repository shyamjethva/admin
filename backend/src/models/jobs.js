import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },

        // ✅ store department as ObjectId
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },

        location: { type: String, default: "" },
        type: { type: String, enum: ["full-time", "part-time", "contract"], default: "full-time" },
        experience: { type: String, default: "" },
        salary: { type: String, default: "" },

        description: { type: String, default: "" },
        requirements: { type: [String], default: [] },

        postedDate: { type: String, default: "" },

        // ✅ typo fixed: status
        status: { type: String, enum: ["open", "closed"], default: "open" },
    },
    { timestamps: true }
);

export default mongoose.model("Job", schema);
