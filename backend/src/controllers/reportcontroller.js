import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";

export const dashboardStats = async (req, res) => {
    const attendanceCount = await Attendance.countDocuments();
    const leavePending = await LeaveRequest.countDocuments({ status: "pending" });

    res.json({
        attendanceCount,
        leavePending
    });
};
