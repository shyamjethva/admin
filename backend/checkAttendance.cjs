require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./src/models/Attendance.js').default;

async function checkAttendance() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const records = await Attendance.find().limit(10);
        console.log('\n=== ATTENDANCE RECORDS ===');
        console.log(`Total records found: ${records.length}\n`);

        records.forEach((record, index) => {
            console.log(`Record ${index + 1}:`);
            console.log(`  ID: ${record._id}`);
            console.log(`  Employee ID: ${record.employeeId}`);
            console.log(`  Employee Name: ${record.employeeName}`);
            console.log(`  Date: ${record.date}`);
            console.log(`  Check In: ${record.checkIn}`);
            console.log(`  Check Out: ${record.checkOut || 'Not clocked out'}`);
            console.log(`  Hours: ${record.hours}`);
            console.log(`  Status: ${record.status}`);
            console.log('---');
        });

        // Check what employee IDs exist
        const employeeIds = [...new Set(records.map(r => r.employeeId))];
        console.log('\n=== EMPLOYEE IDS IN ATTENDANCE ===');
        employeeIds.forEach(id => console.log(`  ${id}`));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔒 Database connection closed');
    }
}

checkAttendance();