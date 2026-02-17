import Attendance from "../models/Attendance.js";
import mongoose from "mongoose";

// Clock In - Create or update attendance record
export const clockIn = async (req, res) => {
    try {
        const { employeeId, employeeName } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const clockInTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

        // Check if attendance record already exists for today
        let attendance = await Attendance.findOne({
            employeeId,
            date: today
        });

        if (attendance) {
            // If record exists, update clockIn time
            attendance.checkIn = clockInTime;
            attendance.checkInTimestamp = new Date();
            attendance.status = "present";
            attendance = await attendance.save();
        } else {
            // Create new attendance record
            attendance = await Attendance.create({
                employeeId,
                employeeName: employeeName || "",
                date: today,
                checkIn: clockInTime,
                checkInTimestamp: new Date(),
                status: "present",
                hours: 0
            });
        }

        // Populate employee details
        const populated = await Attendance.findById(attendance._id)
            .populate("employeeId", "name email");

        res.status(201).json({
            success: true,
            data: populated,
            message: "Clocked in successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Clock Out - Update attendance record with clockOut time
export const clockOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const clockOutTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

        // Find today's attendance record
        const attendance = await Attendance.findOne({
            employeeId,
            date: today
        });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "No clock-in record found for today"
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                success: false,
                message: "Already clocked out today"
            });
        }

        // Update clockOut time
        attendance.checkOut = clockOutTime;

        // Calculate hours worked
        if (attendance.checkIn) {
            const [inHour, inMin] = attendance.checkIn.split(':').map(Number);
            const [outHour, outMin] = clockOutTime.split(':').map(Number);

            let totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);

            // Handle overnight shifts
            if (totalMinutes < 0) {
                totalMinutes += 24 * 60; // Add 24 hours
            }

            attendance.hours = Math.max(0, totalMinutes / 60);
        }

        const updated = await attendance.save();

        // Populate employee details
        const populated = await Attendance.findById(updated._id)
            .populate("employeeId", "name email");

        res.json({
            success: true,
            data: populated,
            message: "Clocked out successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Get today's attendance record for employee
export const getTodayAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const attendance = await Attendance.findOne({
            employeeId,
            date: today
        }).populate("employeeId", "name email");

        res.json({
            success: true,
            data: attendance || null
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Get weekly attendance records for employee
export const getWeeklyAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        console.log('📅 Getting weekly attendance for employeeId:', employeeId);
        console.log('📅 EmployeeId type:', typeof employeeId);

        // Get last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        console.log('📅 Date range:', startDateStr, 'to', endDateStr);

        // Try to find records matching the employeeId (could be string or ObjectId)
        const attendanceRecords = await Attendance.find({
            $or: [
                { employeeId: employeeId },
                { employeeId: mongoose.Types.ObjectId.isValid(employeeId) ? new mongoose.Types.ObjectId(employeeId) : employeeId }
            ],
            date: {
                $gte: startDateStr,
                $lte: endDateStr
            }
        })
            .sort({ date: 1 })
            .populate("employeeId", "name email");

        console.log('📅 Found attendance records:', attendanceRecords.length);
        if (attendanceRecords.length > 0) {
            console.log('📅 Sample record employeeId:', attendanceRecords[0].employeeId);
        }

        res.json({
            success: true,
            data: attendanceRecords
        });
    } catch (err) {
        console.error('❌ Error in getWeeklyAttendance:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Get all attendance records (with optional filters)
export const getAllAttendanceRecords = async (req, res) => {
    try {
        const { employeeId, startDate, endDate } = req.query;

        let query = {};

        if (employeeId) {
            query.employeeId = employeeId;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1, createdAt: -1 })
            .populate("employeeId", "name email");

        res.json({
            success: true,
            data: attendanceRecords
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};