import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
        candidateName: { type: String, required: true },
        position: { type: String, default: "" },
        date: { type: String, required: true },     // "YYYY-MM-DD"
        time: { type: String, required: true },     // "HH:mm"
        interviewer: { type: String, required: true },
        mode: { type: String, enum: ["in-person", "video", "phone"], default: "video" },
        status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    },
    { timestamps: true }
);

export default mongoose.model("Interview", schema);
