import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import dotenv from 'dotenv';
import cron from 'node-cron'; // This will be available since we installed it

dotenv.config();

// Function to mark absent employees for the current day
const markAbsentEmployeesForToday = async () => {
    try {
        console.log(`📅 Running auto-mark absent task at ${new Date().toISOString()}`);

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
                notes: 'Auto-marked as absent - did not clock in today'
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
        console.error('❌ Error in auto-mark absent task:', error);
    }
};

// Connect to MongoDB and schedule the task
const startAutoMarkAbsent = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hr-management');


        // Schedule the task to run daily at 11:59 PM (just before midnight)
        // This ensures that all employees who didn't clock in during the day are marked as absent
        cron.schedule('59 23 * * *', async () => {
            console.log('⏰ Scheduled task triggered: Marking absent employees');
            await markAbsentEmployeesForToday();
        }, {
            timezone: "Asia/Kolkata" // Adjust timezone as needed
        });

        // Also run once immediately for testing
        // Uncomment the next line if you want to run it immediately for testing
        // await markAbsentEmployeesForToday();

    } catch (error) {
        console.error('❌ Error starting auto-mark absent scheduler:', error);
        process.exit(1);
    }
};

// Run the scheduler
startAutoMarkAbsent();

// Export for use in other scripts
export default startAutoMarkAbsent;