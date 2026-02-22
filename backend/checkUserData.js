import('./src/config/db.js').then(async () => {
    const User = await import('./src/models/User.js');
    const Task = await import('./src/models/Task.js');

    console.log('=== USERS ===');
    const users = await User.default.find();
    users.forEach(u => {
        console.log(`${u.name} (${u.email}) - role: ${u.role} - employeeId: ${u.employeeId || 'NULL'}`);
    });

    console.log('\n=== TASKS ===');
    const tasks = await Task.default.find().populate('assignedTo', 'name email');
    tasks.forEach(t => {
        console.log(`Task: ${t.title} - assignedTo: ${t.assignedTo?.name || t.assignedTo} (${t.assignedTo?.email || 'no email'})`);
    });

    process.exit(0);
});