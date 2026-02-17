require('dotenv').config();
const mongoose = require('mongoose');

// Simple task schema to read existing data
const taskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.model('Task', taskSchema, 'tasks');

async function checkTasks() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const tasks = await Task.find({});
        console.log(`\n=== TOTAL TASKS IN DATABASE: ${tasks.length} ===\n`);

        tasks.forEach((task, index) => {
            console.log(`Task ${index + 1}:`);
            console.log(`  ID: ${task._id}`);
            console.log(`  Title: ${task.title || 'No title'}`);
            console.log(`  Assigned To: ${JSON.stringify(task.assignedTo)}`);
            console.log(`  Status: ${task.status || 'No status'}`);
            console.log(`  Priority: ${task.priority || 'No priority'}`);
            console.log('---');
        });

        // Check assignments specifically
        console.log('\n=== ASSIGNMENT ANALYSIS ===');
        const employeeAssignments = {};
        tasks.forEach(task => {
            const assignedTo = task.assignedTo;
            let assigneeKey = 'unassigned';

            if (assignedTo) {
                if (typeof assignedTo === 'string') {
                    assigneeKey = assignedTo;
                } else if (typeof assignedTo === 'object') {
                    assigneeKey = assignedTo.name || assignedTo._id || assignedTo.id || 'unknown object';
                }
            }

            if (!employeeAssignments[assigneeKey]) {
                employeeAssignments[assigneeKey] = [];
            }
            employeeAssignments[assigneeKey].push({
                id: task._id,
                title: task.title || 'Untitled',
                status: task.status || 'unknown'
            });
        });

        Object.entries(employeeAssignments).forEach(([assignee, taskList]) => {
            console.log(`\n${assignee}: ${taskList.length} tasks`);
            taskList.forEach(task => {
                console.log(`  - ${task.title} (${task.status})`);
            });
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔒 Database connection closed');
    }
}

checkTasks();