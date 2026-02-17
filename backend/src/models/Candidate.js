import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },

        experience: { type: String, required: true, trim: true }, // ✅ ADD
        appliedDate: { type: String }, // ✅ optional (frontend sends yyyy-mm-dd)

        status: {
            type: String,
            enum: ["applied", "screening", "interview", "offered", "rejected"], // ✅ match frontend
            default: "applied",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Candidate", schema);
