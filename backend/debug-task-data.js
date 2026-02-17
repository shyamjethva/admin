// Debug script to check the data structure and relationships
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Employee from './src/models/Employee.js';
import Task from './src/models/Task.js';

async function debugDataStructure() {
    console.log('🔍 Debugging data structure...\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/adminpanel_test');
        console.log('✅ Connected to MongoDB\n');

        // Get sample users
        console.log('👥 Sample Users:');
        const users = await User.find().limit(5);
        users.forEach(user => {
            console.log(`  - User: ${user.name} (${user._id}), Role: ${user.role}, employeeId: ${user.employeeId}`);
        });
        console.log('');

        // Get sample employees
        console.log('👷 Sample Employees:');
        const employees = await Employee.find().limit(5);
        employees.forEach(emp => {
            console.log(`  - Employee: ${emp.name} (${emp._id})`);
        });
        console.log('');

        // Get sample tasks
        console.log('📋 Sample Tasks:');
        const tasks = await Task.find().limit(5).populate('assignedTo', 'name email');
        tasks.forEach(task => {
            console.log(`  - Task: "${task.title}", assignedTo: ${task.assignedTo ? task.assignedTo.name : 'None'} (${task.assignedTo ? task.assignedTo._id : 'None'})`);
        });
        console.log('');

        // Check if there's a user with employee role and see if their employeeId matches any employee
        const employeeUsers = await User.find({ role: 'employee' }).limit(3);
        console.log('🔍 Checking employee user mappings:');
        for (const user of employeeUsers) {
            console.log(`  \nUser: ${user.name} (ID: ${user._id})`);
            console.log(`    User employeeId: ${user.employeeId}`);

            if (user.employeeId) {
                // Try to find employee by the employeeId
                const employee = await Employee.findById(user.employeeId);
                console.log(`    Matching Employee: ${employee ? employee.name : 'NOT FOUND'}`);
            }

            // Check if there are any tasks assigned to this user's employeeId
            const assignedTasks = await Task.find({ assignedTo: user.employeeId });
            console.log(`    Tasks assigned to user.employeeId: ${assignedTasks.length}`);

            // Check if there are any tasks assigned to any employee with matching email
            if (user.email) {
                const empByEmail = await Employee.findOne({ email: user.email });
                if (empByEmail) {
                    const tasksByEmail = await Task.find({ assignedTo: empByEmail._id });
                    console.log(`    Tasks assigned to employee with matching email: ${tasksByEmail.length}`);
                    console.log(`    Email-matching Employee ID: ${empByEmail._id}`);
                }
            }
        }

        console.log('\n✅ Debug completed!');

    } catch (error) {
        console.error('❌ Error during debugging:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the debug
debugDataStructure();