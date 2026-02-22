require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee.js').default;

async function checkEmployees() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adminpanel');
        console.log('✅ Connected to MongoDB');

        const employees = await Employee.find();
        console.log(`\nFound ${employees.length} employees:`);

        employees.forEach((emp, index) => {
            console.log(`${index + 1}. ${emp.name} - Status: '${emp.status}' (type: ${typeof emp.status})`);
        });

        // Check status values
        const statusCounts = {};
        employees.forEach(emp => {
            const status = emp.status || 'undefined';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        console.log('\nStatus distribution:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkEmployees();