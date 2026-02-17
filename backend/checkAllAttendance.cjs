require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./src/models/Attendance.js').default;

async function checkAllAttendance() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const records = await Attendance.find().sort({ date: -1, createdAt: -1 });
        console.log('\n=== ALL ATTENDANCE RECORDS (Sorted by date DESC) ===');
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
            console.log(`  Created: ${record.createdAt}`);
            console.log('---');
        });

        // Group by date
        console.log('\n=== RECORDS BY DATE ===');
        const dates = {};
        records.forEach(record => {
            if (!dates[record.date]) dates[record.date] = [];
            dates[record.date].push({
                employeeName: record.employeeName,
                employeeId: record.employeeId,
                checkIn: record.checkIn,
                checkOut: record.checkOut,
                hours: record.hours
            });
        });

        Object.keys(dates).sort().forEach(date => {
            console.log(`\n📅 ${date} (${dates[date].length} records):`);
            dates[date].forEach(rec => {
                console.log(`  - ${rec.employeeName} (${rec.employeeId}): ${rec.checkIn} → ${rec.checkOut || 'Open'} (${rec.hours}h)`);
            });
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔒 Database connection closed');
    }
}

checkAllAttendance();