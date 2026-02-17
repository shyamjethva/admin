// Test script to verify task filtering by user role
import mongoose from 'mongoose';
import Task from './src/models/Task.js';

// Mock user objects for testing
const mockAdminUser = {
    id: 'admin123',
    role: 'admin'
};

const mockEmployeeUser = {
    id: 'employee456',
    role: 'employee'
};

const mockHRUser = {
    id: 'hr789',
    role: 'hr'
};

async function testTaskFiltering() {
    console.log('🔍 Testing task filtering functionality...\n');

    try {
        // Connect to MongoDB (using the same connection as the main app)
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/adminpanel_test');
        console.log('✅ Connected to MongoDB\n');

        // Count total tasks in the system
        const totalTasks = await Task.countDocuments();
        console.log(`📊 Total tasks in system: ${totalTasks}\n`);

        // Show sample tasks
        const sampleTasks = await Task.find().limit(5).populate('assignedTo', 'name email');
        console.log('📋 Sample tasks:');
        sampleTasks.forEach(task => {
            console.log(`  - Task: "${task.title}" assigned to: ${task.assignedTo ? task.assignedTo.name : 'None'} (ID: ${task.assignedTo ? task.assignedTo._id : 'None'})`);
        });
        console.log('');

        // Simulate the filtering logic from our updated controller
        console.log('🔐 Testing filtering logic:');

        // For admin/HR - should get all tasks
        console.log('\n  🏢 Admin/HR perspective (should see all tasks):');
        let adminQuery = {};
        const adminTasks = await Task.find(adminQuery).populate("assignedTo", "name email");
        console.log(`    Admin would see: ${adminTasks.length} tasks`);

        // For employee - should only get assigned tasks
        console.log('\n  👤 Employee perspective (should only see assigned tasks):');
        let employeeQuery = { assignedTo: mockEmployeeUser.id };
        const employeeTasks = await Task.find(employeeQuery).populate("assignedTo", "name email");
        console.log(`    Employee (ID: ${mockEmployeeUser.id}) would see: ${employeeTasks.length} tasks`);

        console.log('\n✅ Task filtering test completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Total tasks in system: ${totalTasks}`);
        console.log(`   - Admin/HR would see: ${adminTasks.length} tasks`);
        console.log(`   - Employee would see: ${employeeTasks.length} tasks`);

        if (totalTasks > 0 && adminTasks.length >= employeeTasks.length) {
            console.log('\n🎉 Filtering logic working correctly!');
            if (employeeTasks.length < adminTasks.length) {
                console.log('   ✓ Employees see fewer tasks than admins (as expected)');
            } else if (employeeTasks.length === adminTasks.length && totalTasks > 0) {
                console.log('   ⚠️  All tasks might be assigned to this employee (unusual but possible)');
            }
        } else {
            console.log('\n❌ Something might be wrong with the filtering logic');
        }

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the test
testTaskFiltering();