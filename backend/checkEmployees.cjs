require('dotenv').config();
const mongoose = require('mongoose');

// Simple employee schema to read existing data
const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', employeeSchema, 'users');

async function checkEmployees() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const employees = await Employee.find({});
        console.log(`\n=== EMPLOYEES IN DATABASE: ${employees.length} ===\n`);

        employees.forEach((emp, index) => {
            console.log(`Employee ${index + 1}:`);
            console.log(`  ID: ${emp._id}`);
            console.log(`  Name: ${emp.name || emp.username || 'No name'}`);
            console.log(`  Email: ${emp.email || 'No email'}`);
            console.log(`  Role: ${emp.role || 'No role'}`);
            console.log('---');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔒 Database connection closed');
    }
}

checkEmployees();