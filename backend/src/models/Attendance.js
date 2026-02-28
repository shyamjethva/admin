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

        // Current status
        status: {
            type: String,
            enum: ["clocked_out", "clocked_in", "on_break"],
            default: "clocked_out",
        },

        // Multiple sessions support
        sessions: [
            {
                clockInAt: { type: Date, required: true },
                clockOutAt: { type: Date },
                durationSeconds: { type: Number, default: 0 }
            }
        ],

        // Break tracking
        breaks: [
            {
                breakInAt: { type: Date, required: true },
                breakOutAt: { type: Date },
                durationSeconds: { type: Number, default: 0 }
            }
        ],

        // Convenience fields for display
        breakIn: { type: String }, // "13:00:00"
        breakOut: { type: String }, // "14:00:00"
        breakDuration: { type: Number, default: 0 }, // in minutes

        // Total time calculations
        totals: {
            totalClockSeconds: { type: Number, default: 0 },
            totalBreakSeconds: { type: Number, default: 0 },
            workSeconds: { type: Number, default: 0 } // totalClockSeconds - totalBreakSeconds
        },

        // Tracking for validation
        lastClockInAt: { type: Date },
        currentSessionOpen: { type: Boolean, default: false },
        currentBreakOpen: { type: Boolean, default: false },

        // Legacy fields (for backward compatibility)
        checkIn: { type: String }, // "09:00:00"
        checkInTimestamp: { type: Date }, // ISO timestamp for timer
        checkOut: { type: String }, // "18:00:00"
        checkOutTimestamp: { type: Date }, // ISO timestamp for timer
        hours: { type: Number, default: 0 },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

// Prevent duplicate attendance for same employee + date
// attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);