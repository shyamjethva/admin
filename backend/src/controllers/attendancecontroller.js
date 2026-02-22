import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

export const getAllAttendance = async (req, res) => {
    try {
        console.log('🔍 Getting all attendance records...');
        console.log('🔍 User from token:', req.user);

        const list = await Attendance.find()
            .populate("employeeId", "name email")
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${list.length} attendance records`);
        res.json(list);
    } catch (err) {
        console.error('❌ Error in getAllAttendance:', err);
        console.error('❌ Error stack:', err.stack);
        res.status(500).json({ message: err.message });
    }
};

export const createAttendance = async (req, res) => {
    try {
        console.log('🔍 Creating attendance record:', req.body);
        // Validate required fields
        if (!req.body.employeeId) {
            return res.status(400).json({ message: "Employee ID is required" });
        }
        if (!req.body.date) {
            return res.status(400).json({ message: "Date is required" });
        }
        if (!req.body.checkIn) {
            return res.status(400).json({ message: "Check In time is required" });
        }

        const payload = {
            employeeId: req.body.employeeId,
            employeeName: req.body.employeeName,
            date: req.body.date,
            checkIn: req.body.checkIn,
            checkOut: req.body.checkOut,
            status: req.body.status,
            hours: req.body.hours,
            notes: req.body.notes,
        };

        // Check if attendance already exists for this employee on this date
        const existing = await Attendance.findOne({
            employeeId: req.body.employeeId,
            date: req.body.date
        });

        let result;
        if (existing) {
            console.log('🔄 Updating existing attendance record');
            // Update existing attendance
            result = await Attendance.findByIdAndUpdate(existing._id, payload, { new: true })
                .populate("employeeId", "name email");
            return res.json(result);
        }

        // Create new attendance
        console.log('🆕 Creating new attendance record');
        const created = await Attendance.create(payload);
        const populated = await Attendance.findById(created._id).populate("employeeId", "name email");
        console.log('✅ Attendance record created successfully');
        res.status(201).json(populated);
    } catch (err) {
        console.error('❌ Error in createAttendance:', err);
        res.status(500).json({ message: err.message });
    }
};

// Mark absent employees for a specific date
export const markAbsentEmployees = async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0]; // Use provided date or today

        console.log(`📅 Marking absent employees for date: ${targetDate}`);

        // Get all employees
        const employees = await Employee.find({}, '_id name');
        console.log(`👥 Found ${employees.length} employees`);

        // Get attendance records for the target date
        const existingAttendances = await Attendance.find({ date: targetDate });
        console.log(`📋 Found ${existingAttendances.length} existing attendance records for ${targetDate}`);

        // Get employee IDs who have already clocked in today
        const presentEmployeeIds = existingAttendances.map(att => att.employeeId.toString());

        // Find employees who haven't clocked in today
        const absentEmployees = employees.filter(emp =>
            !presentEmployeeIds.includes(emp._id.toString())
        );

        console.log(`👤 ${absentEmployees.length} employees marked as absent`);

        // Create attendance records for absent employees
        const absentRecords = [];
        for (const employee of absentEmployees) {
            const absentRecord = {
                employeeId: employee._id,
                employeeName: employee.name,
                date: targetDate,
                checkIn: null, // No check-in time
                checkOut: null, // No check-out time
                status: 'absent',
                hours: 0,
                notes: 'Marked as absent - did not clock in today'
            };

            // Check if an attendance record already exists for this employee today
            const existingRecord = await Attendance.findOne({
                employeeId: employee._id,
                date: targetDate
            });

            if (!existingRecord) {
                const createdRecord = await Attendance.create(absentRecord);
                absentRecords.push(createdRecord);
                console.log(`📝 Created absent record for ${employee.name} (ID: ${employee._id})`);
            } else {
                console.log(`⚠️  Absent record already exists for ${employee.name} (ID: ${employee._id})`);
            }
        }

        res.json({
            success: true,
            message: `Successfully marked ${absentRecords.length} employees as absent for ${targetDate}`,
            data: {
                date: targetDate,
                totalEmployees: employees.length,
                absentCount: absentRecords.length,
                presentCount: existingAttendances.length
            }
        });

    } catch (err) {
        console.error('❌ Error marking absent employees:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateAttendance = async (req, res) => {
    try {
        const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("employeeId", "name email");
        if (!updated) return res.status(404).json({ message: "Attendance not found" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteAttendance = async (req, res) => {
    try {
        const deleted = await Attendance.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Attendance not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
