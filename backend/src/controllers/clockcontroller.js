import Attendance from "../models/Attendance.js";
import mongoose from "mongoose";

const getISTInfo = () => {
    const realNow = new Date();
    // IST is UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTimestamp = new Date(realNow.getTime() + istOffset);

    // Format: YYYY-MM-DD (based on IST)
    const date = istTimestamp.toISOString().split('T')[0];

    // Format: HH:MM:SS (based on IST)
    const time = istTimestamp.toISOString().split('T')[1].split('.')[0];

    // This Date object is manually offset to "look" like IST in MongoDB
    // Note: Frontend timers will need to account for this 5.5h offset
    const istDateObject = istTimestamp;

    return { date, time, istDateObject };
};

// Clock In - Create or update attendance record
export const clockIn = async (req, res) => {
    console.log('🔵 CLOCK IN ENDPOINT HIT');
    console.log('🔵 Request body:', req.body);

    try {
        const { employeeId, employeeName } = req.body;

        // Validate required fields
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });
        }

        const { date: today, time: clockInTime, istDateObject: clockInTimestamp } = getISTInfo();

        console.log('⏰ Clock in time recorded (IST):', clockInTime);
        console.log('⏰ Today date (IST):', today);

        // Check if attendance record already exists for today
        let query = { date: today };

        // Handle employeeId properly
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query.employeeId = new mongoose.Types.ObjectId(employeeId);
        } else {
            query.employeeId = employeeId;
        }

        let attendance = await Attendance.findOne(query);

        // Validation: Cannot clock in if already working or on break
        if (attendance && (attendance.status === "clocked_in" || attendance.status === "on_break")) {
            return res.status(400).json({
                success: false,
                message: "Cannot clock in while already working or on break"
            });
        }

        if (attendance) {
            // Add new session
            attendance.sessions.push({
                clockInAt: clockInTimestamp,
                clockOutAt: null,
                durationSeconds: 0
            });

            // Update fields
            attendance.checkIn = clockInTime;
            attendance.checkInTimestamp = clockInTimestamp;
            attendance.status = "clocked_in";
            attendance.currentSessionOpen = true;
            attendance.lastClockInAt = clockInTimestamp;

            attendance = await attendance.save();
            console.log('✅ Added new session to existing attendance record');
        } else {
            // Create new attendance record
            attendance = await Attendance.create({
                employeeId,
                employeeName: employeeName || "",
                date: today,
                status: "clocked_in",
                sessions: [{
                    clockInAt: clockInTimestamp,
                    clockOutAt: null,
                    durationSeconds: 0
                }],
                breaks: [],
                totals: {
                    totalClockSeconds: 0,
                    totalBreakSeconds: 0,
                    workSeconds: 0
                },
                checkIn: clockInTime,
                checkInTimestamp: clockInTimestamp,
                currentSessionOpen: true,
                lastClockInAt: clockInTimestamp,
                hours: 0
            });
            console.log('✅ Created new attendance record with session');
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
            message: err.message
        });
    }
};

// Clock Out - Update attendance record with clockOut time
export const clockOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const { date: today, time: clockOutTime, istDateObject: clockOutTimestamp } = getISTInfo();

        console.log('⏰ Clock out time recorded (IST):', clockOutTime);

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

        // Validation: Cannot clock out while on break
        if (attendance.status === "on_break") {
            return res.status(400).json({
                success: false,
                message: "Cannot clock out while on break"
            });
        }

        // Validation: Must have open session
        if (!attendance.currentSessionOpen) {
            return res.status(400).json({
                success: false,
                message: "No active session to clock out from"
            });
        }

        // Validation: Minimum 1 minute rule
        if (attendance.lastClockInAt) {
            const { istDateObject: now } = getISTInfo();
            const timeDiff = (now.getTime() - attendance.lastClockInAt.getTime()) / 1000;
            if (timeDiff < 60) {
                return res.status(400).json({
                    success: false,
                    message: `Must wait at least 1 minute after clock in (wait ${Math.ceil(60 - timeDiff)} more seconds)`
                });
            }
        }

        // Close current session
        const currentSession = attendance.sessions[attendance.sessions.length - 1];
        if (currentSession && !currentSession.clockOutAt) {
            currentSession.clockOutAt = clockOutTimestamp;
            const duration = (clockOutTimestamp.getTime() - currentSession.clockInAt.getTime()) / 1000;
            currentSession.durationSeconds = Math.max(0, duration);

            // Update totals
            attendance.totals.totalClockSeconds += currentSession.durationSeconds;
        }

        // Calculate work seconds (total clock time - total break time)
        attendance.totals.workSeconds = Math.max(0, attendance.totals.totalClockSeconds - attendance.totals.totalBreakSeconds);

        // Update legacy fields
        attendance.checkOut = clockOutTime;
        attendance.checkOutTimestamp = clockOutTimestamp;
        attendance.hours = attendance.totals.workSeconds / 3600;

        // Update status
        attendance.status = "clocked_out";
        attendance.currentSessionOpen = false;
        attendance.currentBreakOpen = false;

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

// Break In - Start a break during working time
export const breakIn = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const { date: today, time: currentTimeStr, istDateObject: now } = getISTInfo();

        // Find today's attendance record
        let query = { date: today };
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query.employeeId = new mongoose.Types.ObjectId(employeeId);
        } else {
            query.employeeId = employeeId;
        }

        const attendance = await Attendance.findOne(query);

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: "Must clock in before taking a break"
            });
        }

        // Validation: Must be working to take a break
        if (attendance.status !== "clocked_in") {
            return res.status(400).json({
                success: false,
                message: "Can only take break while working"
            });
        }

        // Validation: Must have open session
        if (!attendance.currentSessionOpen) {
            return res.status(400).json({
                success: false,
                message: "No active session"
            });
        }

        // Validation: Cannot have open break
        if (attendance.currentBreakOpen) {
            return res.status(400).json({
                success: false,
                message: "Already on break"
            });
        }

        // Validation: Minimum 1 minute rule after clock in or previous break end
        const { istDateObject: nowIST } = getISTInfo();
        if (attendance.lastClockInAt) {
            const timeDiff = (nowIST.getTime() - attendance.lastClockInAt.getTime()) / 1000;
            if (timeDiff < 60) {
                return res.status(400).json({
                    success: false,
                    message: `Must wait at least 1 minute after clock in before taking a break (wait ${Math.ceil(60 - timeDiff)} more seconds)`
                });
            }
        }

        // Also check if they just ended another break
        const lastBreak = attendance.breaks[attendance.breaks.length - 1];
        if (lastBreak && lastBreak.breakOutAt) {
            const timeDiff = (nowIST.getTime() - lastBreak.breakOutAt.getTime()) / 1000;
            if (timeDiff < 60) {
                return res.status(400).json({
                    success: false,
                    message: `Must wait at least 1 minute after previous break (wait ${Math.ceil(60 - timeDiff)} more seconds)`
                });
            }
        }

        // Add break record
        attendance.breaks.push({
            breakInAt: now,
            breakOutAt: null,
            durationSeconds: 0
        });

        // Update status and convenience fields
        attendance.status = "on_break";
        attendance.currentBreakOpen = true;
        attendance.breakIn = currentTimeStr;
        attendance.breakOut = null; // Reset breakout when new break starts

        const updated = await attendance.save();

        const populated = await Attendance.findById(updated._id)
            .populate("employeeId", "name email");

        res.json({
            success: true,
            data: populated,
            message: "Break started successfully"
        });
    } catch (err) {
        console.error('❌ BREAK IN ERROR:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Break Out - End a break and return to work
export const breakOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const { date: today, time: currentTimeStr, istDateObject: now } = getISTInfo();

        // Find today's attendance record
        let query = { date: today };
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query.employeeId = new mongoose.Types.ObjectId(employeeId);
        } else {
            query.employeeId = employeeId;
        }

        const attendance = await Attendance.findOne(query);

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "No attendance record found"
            });
        }

        // Validation: Must be on break
        if (attendance.status !== "on_break") {
            return res.status(400).json({
                success: false,
                message: "Not currently on break"
            });
        }

        // Validation: Must have open break
        if (!attendance.currentBreakOpen) {
            return res.status(400).json({
                success: false,
                message: "No active break to end"
            });
        }

        // Validation: Minimum 1 minute rule for break
        const latestBreak = attendance.breaks[attendance.breaks.length - 1];
        if (latestBreak && latestBreak.breakInAt) {
            const timeDiff = (now.getTime() - latestBreak.breakInAt.getTime()) / 1000;
            if (timeDiff < 60) {
                return res.status(400).json({
                    success: false,
                    message: `Must wait at least 1 minute after break in (wait ${Math.ceil(60 - timeDiff)} more seconds)`
                });
            }
        }

        // Close current break
        const currentBreak = attendance.breaks[attendance.breaks.length - 1];
        if (currentBreak && !currentBreak.breakOutAt) {
            currentBreak.breakOutAt = now;
            const duration = (now.getTime() - currentBreak.breakInAt.getTime()) / 1000;
            currentBreak.durationSeconds = Math.max(0, duration);

            // Update totals
            attendance.totals.totalBreakSeconds += currentBreak.durationSeconds;
        }

        // Calculate work seconds
        attendance.totals.workSeconds = Math.max(0, attendance.totals.totalClockSeconds - attendance.totals.totalBreakSeconds);

        // Update status and convenience fields
        attendance.status = "clocked_in";
        attendance.currentBreakOpen = false;
        attendance.breakOut = currentTimeStr;
        attendance.breakDuration = Math.round(attendance.totals.totalBreakSeconds / 60);
        attendance.hours = attendance.totals.workSeconds / 3600;

        const updated = await attendance.save();

        const populated = await Attendance.findById(updated._id)
            .populate("employeeId", "name email");

        res.json({
            success: true,
            data: populated,
            message: "Break ended successfully"
        });
    } catch (err) {
        console.error('❌ BREAK OUT ERROR:', err);
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
        const { date: today } = getISTInfo();

        console.log('🔍 getTodayAttendance called for employeeId:', employeeId);
        console.log('📅 Today is:', today, '(IST)');
        console.log('📅 UTC date would be:', new Date().toISOString().split('T')[0], 'for comparison');

        let query = { date: today };

        // Handle employeeId properly
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query.employeeId = new mongoose.Types.ObjectId(employeeId);
            console.log('📋 Query using ObjectId for employeeId:', query.employeeId);
        } else {
            query.employeeId = employeeId;
            console.log('📋 Query using string for employeeId:', query.employeeId);
        }

        console.log('🔍 Query being executed:', JSON.stringify(query, null, 2));

        const attendance = await Attendance.findOne(query).populate("employeeId", "name email");

        console.log('🔍 Found attendance record:', attendance ? {
            _id: attendance._id,
            date: attendance.date,
            checkIn: attendance.checkIn,
            checkOut: attendance.checkOut,
            employeeId: attendance.employeeId
        } : 'No record found');

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