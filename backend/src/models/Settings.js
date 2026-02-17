import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    // Company settings (single document)
    companyName: { type: String, default: "Error Infotech" },
    industry: { type: String, default: "Information Technology" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    timezone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "INR" },

    // Notification settings (per user)
    notificationSettings: {
        emailNotifications: { type: Boolean, default: true },
        leaveRequests: { type: Boolean, default: true },
        taskAssignments: { type: Boolean, default: true },
        announcements: { type: Boolean, default: true },
        birthdays: { type: Boolean, default: true },
        workAnniversaries: { type: Boolean, default: true },
        holidays: { type: Boolean, default: false },
        chatMessages: { type: Boolean, default: true },
    },
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
