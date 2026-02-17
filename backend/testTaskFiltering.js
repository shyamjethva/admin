// Test the task filtering logic
const testUser = {
    id: "698d954999af626be08f90f3",
    name: "manav",
    role: "employee"
};

const testTasks = [
    {
        _id: "698c1d7262859b1be1d3a161",
        title: "task",
        assignedTo: "6982e225109a02a13ffbf2e2",
        status: "pending",
        priority: "high"
    },
    {
        _id: "6991e37d274fb63a41efef5e",
        title: "Complete Employee Dashboard",
        assignedTo: "698d954999af626be08f90f3",
        status: "pending",
        priority: "high"
    },
    {
        _id: "6991e3c59bea4645b463d890",
        title: "Review Documentation",
        assignedTo: "698d954999af626be08f90f3",
        status: "in-progress",
        priority: "medium"
    }
];

// Our filtering function (simplified version)
function isTaskAssignedToUser(task, currentUser) {
    if (!currentUser || !task) return false;

    const assignedTo = task.assignedTo;
    if (!assignedTo) return false;

    // If assignedTo is an object with _id or id
    if (typeof assignedTo === 'object') {
        return (assignedTo._id || assignedTo.id) === currentUser.id;
    }

    // If assignedTo is a string
    const assignedToString = assignedTo.toString().trim();
    if (!assignedToString) return false;

    // Direct ID match
    if (assignedToString === currentUser.id) return true;

    return false;
}

// Test the filtering
const canEdit = testUser.role === 'admin' || testUser.role === 'hr';
const filteredTasks = testTasks.filter(task => {
    const userMatch = canEdit || isTaskAssignedToUser(task, testUser);
    return userMatch;
});

console.log('=== TASK FILTERING TEST ===');
console.log('User:', testUser.name, `(${testUser.id})`);
console.log('Can edit (admin/hr):', canEdit);
console.log('Total tasks in system:', testTasks.length);
console.log('Tasks visible to user:', filteredTasks.length);
console.log('\nVisible tasks:');
filteredTasks.forEach(task => {
    console.log(`- ${task.title} (${task.status})`);
});