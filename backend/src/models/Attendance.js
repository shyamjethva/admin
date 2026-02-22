import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: false,
        },

        // Optional: quick display
        employeeName: { type: String, trim: true },

        date: {
            type: String, // "YYYY-MM-DD"
            required: true,
        },

        checkIn: {
            type: String,
            required: false
        }, // "09:00"
        checkInTimestamp: { type: Date }, // ISO timestamp for timer
        checkOut: {
            type: String,
            required: false
        },                 // "18:00"

        status: {
            type: String,
            enum: ["present", "absent", "late", "half-day"],
            default: "present",
        },

        hours: { type: Number, default: 0 },

        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

// Prevent duplicate attendance for same employee + date
// attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
