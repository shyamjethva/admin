import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
    {
        employeeId: { type: String, required: true },
        employeeName: { type: String, default: "" },

        leaveTypeId: { type: String, default: "" },
        leaveTypeName: { type: String, default: "" },
        leaveTypeCode: { type: String, default: "" },

        fromDate: { type: String, required: true },
        toDate: { type: String, required: true },

        reason: { type: String, default: "" },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        createdBy: { type: String, default: "" },
    },
    { timestamps: true }
);

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
export default LeaveRequest;
