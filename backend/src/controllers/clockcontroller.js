import Attendance from "../models/Attendance.js";
import mongoose from "mongoose";

// Clock In - Create or update attendance record
export const clockIn = async (req, res) => {
    console.log('🔵 CLOCK IN ENDPOINT HIT');
    console.log('🔵 Request headers:', req.headers);
    console.log('🔵 Request body:', req.body);
    console.log('🔵 User from auth:', req.user);

    try {
        const { employeeId, employeeName } = req.body;
        console.log('🔵 CLOCK IN REQUEST:', { employeeId, employeeName });

        // Validate required fields for non-absent status
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });
        }

        const today = new Date().toISOString().split('T')[0];
        // Capture the EXACT time when the request is processed (when button is clicked)
        const currentTime = new Date();
        const clockInTime = currentTime.toTimeString().split(' ')[0]; // HH:MM:SS format
        const clockInTimestamp = currentTime; // Full timestamp with milliseconds

        console.log('⏰ Clock in time being recorded:', clockInTime);
        console.log('⏰ Clock in timestamp being recorded:', clockInTimestamp);
        console.log('⏰ Current time when processing request:', new Date());

        // Check if attendance record already exists for today
        let query = { date: today };

        // Handle employeeId properly - check if it's a valid ObjectId string
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
            console.log('✅ Valid ObjectId, converting to ObjectId');
            query.employeeId = new mongoose.Types.ObjectId(employeeId);
        } else {
            console.log('⚠️ Invalid ObjectId format, using string');
            query.employeeId = employeeId;
        }

        console.log('🔍 Attendance query:', JSON.stringify(query, null, 2));
        console.log('⏰ Clock in time being recorded:', clockInTime);
        console.log('⏰ Timestamp being recorded:', clockInTimestamp);

        let attendance = await Attendance.findOne(query);

        if (attendance) {
            // If record exists, update clockIn time
            attendance.checkIn = clockInTime;
            attendance.checkInTimestamp = clockInTimestamp;
            attendance.status = "present";
            attendance = await attendance.save();
            console.log('✅ Updated existing attendance record with current time:', clockInTime);
        } else {
            // Create new attendance record
            attendance = await Attendance.create({
                employeeId,
                employeeName: employeeName || "",
                date: today,
                checkIn: clockInTime,
                checkInTimestamp: clockInTimestamp,
                status: "present",
                hours: 0
            });
            console.log('✅ Created new attendance record with current time:', clockInTime);
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
        console.error('❌ CLOCK IN ERROR:', err);
        console.error('❌ Error stack:', err.stack);
        res.status(500).json({
            success: false,
            message: err.message,
            error: err.name
        });
    }
};

// Clock Out - Update attendance record with clockOut time
export const clockOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = new Date().toISOString().split('T')[0];
        // Capture the EXACT time when the request is processed (when button is clicked)
        const currentTime = new Date();
        const clockOutTime = currentTime.toTimeString().split(' ')[0]; // HH:MM:SS format
        const clockOutTimestamp = currentTime; // Full timestamp with milliseconds

        console.log('⏰ Clock out time being recorded:', clockOutTime);
        console.log('⏰ Clock out timestamp being recorded:', clockOutTimestamp);
        console.log('⏰ Current time when processing request:', new Date());

        // Find today's attendance record
        let query = { date: today };

        // Handle employeeId properly
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query.employeeId = new mongoose.Types.ObjectId(employeeId);
        } else {
            query.employeeId = employeeId;
        }

        const attendance = await Attendance.findOne(query);

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

        // Update clockOut time and timestamp
        attendance.checkOut = clockOutTime;
        attendance.checkOutTimestamp = clockOutTimestamp; // Add the checkout timestamp

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

        console.log('✅ Updated attendance record with checkout time:', clockOutTime);

        res.json({
            success: true,
            data: populated,
            message: "Clocked out successfully"
        });
    } catch (err) {
        console.error('❌ CLOCK OUT ERROR:', err);
        console.error('❌ Error stack:', err.stack);
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

        let query = { date: today };

        // Handle employeeId properly
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query.employeeId = new mongoose.Types.ObjectId(employeeId);
        } else {
            query.employeeId = employeeId;
        }

        const attendance = await Attendance.findOne(query).populate("employeeId", "name email");

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
        let query = {
            date: {
                $gte: startDateStr,
                $lte: endDateStr
            }
        };

        // Handle employeeId properly
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query.employeeId = new mongoose.Types.ObjectId(employeeId);
        } else {
            query.employeeId = employeeId;
        }

        const attendanceRecords = await Attendance.find(query)
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
            // Handle employeeId properly
            if (mongoose.Types.ObjectId.isValid(employeeId)) {
                query.employeeId = new mongoose.Types.ObjectId(employeeId);
            } else {
                query.employeeId = employeeId;
            }
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