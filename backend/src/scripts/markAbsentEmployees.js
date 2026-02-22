import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import dotenv from 'dotenv';

dotenv.config();

const markAbsentEmployees = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hr-management');
        console.log('✅ Connected to MongoDB');

        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        console.log(`📅 Marking absent employees for date: ${today}`);

        // Get all employees
        const employees = await Employee.find({}, '_id name');
        console.log(`👥 Found ${employees.length} employees`);

        // Get attendance records for today
        const existingAttendances = await Attendance.find({ date: today });
        console.log(`📋 Found ${existingAttendances.length} existing attendance records for today`);

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
                date: today,
                checkIn: null, // No check-in time
                checkOut: null, // No check-out time
                status: 'absent',
                hours: 0,
                notes: 'Marked as absent - did not clock in today'
            };

            // Check if an attendance record already exists for this employee today
            const existingRecord = await Attendance.findOne({
                employeeId: employee._id,
                date: today
            });

            if (!existingRecord) {
                const createdRecord = await Attendance.create(absentRecord);
                absentRecords.push(createdRecord);
                console.log(`📝 Created absent record for ${employee.name} (ID: ${employee._id})`);
            } else {
                console.log(`⚠️  Absent record already exists for ${employee.name} (ID: ${employee._id})`);
            }
        }

        console.log(`✅ Successfully marked ${absentRecords.length} employees as absent for ${today}`);

    } catch (error) {
        console.error('❌ Error marking absent employees:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
    }
};

// Run the script
markAbsentEmployees();

// Export for use in cron jobs or other scripts
export default markAbsentEmployees;