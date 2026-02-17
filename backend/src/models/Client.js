import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
    {
        company: { type: String, required: true, trim: true },
        contactPerson: { type: String, required: true, trim: true },

        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },

        industry: { type: String, default: "", trim: true },
        projects: { type: Number, default: 0 },
        address: { type: String, default: "", trim: true },

        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
