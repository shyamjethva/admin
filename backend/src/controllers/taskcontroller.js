import Task from "../models/Task.js";

// GET /api/tasks
export const getTasks = async (req, res) => {
    try {
        const { role, id } = req.user;
        let query = {};

        console.log(`🔍 getTasks called - User ID: ${id}, Role: ${role}`);

        // If user is not admin or hr, only show tasks assigned to them
        if (role !== 'admin' && role !== 'hr') {
            // Get the current user to access their employeeId
            const User = await import('../models/User.js');
            const currentUser = await User.default.findById(id).select('employeeId email role name');

            console.log(`👤 Current user:`, JSON.stringify({
                id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                employeeId: currentUser.employeeId,
                role: currentUser.role
            }, null, 2));

            if (currentUser && currentUser.employeeId) {
                // Try matching using the stored employeeId
                const mongoose = await import('mongoose');

                console.log(`👤 User's employeeId: "${currentUser.employeeId}" (type: ${typeof currentUser.employeeId})`);
                console.log(`👤 Is valid ObjectId:`, mongoose.Types.ObjectId.isValid(currentUser.employeeId));

                // Handle multiple possible formats of the employee ID
                const possibleIds = [];

                // Add the direct employeeId
                possibleIds.push(currentUser.employeeId);

                // If it's a valid ObjectId string, also add the ObjectId version
                if (mongoose.Types.ObjectId.isValid(currentUser.employeeId)) {
                    possibleIds.push(new mongoose.Types.ObjectId(currentUser.employeeId));
                }

                // Query for any of these possible IDs
                query.assignedTo = { $in: possibleIds };
                console.log(`📋 Query using possible IDs:`, possibleIds);
            } else if (currentUser && currentUser.email) {
                // Alternative approach: try to match by employee email
                console.log(`📧 Attempting email-based matching with: ${currentUser.email}`);
                const Employee = await import('../models/Employee.js');
                const employee = await Employee.findOne({ email: currentUser.email });

                console.log(`📧 Email match result:`, employee ? `Found employee: ${employee.name} (ID: ${employee._id})` : 'NOT FOUND');

                if (employee) {
                    // Again, handle multiple possible ID formats for the employee
                    const mongoose = await import('mongoose');
                    const possibleEmpIds = [employee._id];

                    // Add string version if different
                    if (employee._id.toString() !== currentUser.email) { // Just a check to avoid adding email
                        possibleEmpIds.push(employee._id.toString());
                    }

                    query.assignedTo = { $in: possibleEmpIds };
                    console.log(`📋 Query using possible employee IDs:`, possibleEmpIds);
                } else {
                    // If no matching employee found, return empty result
                    console.log('❌ No matching employee found, returning empty task list');
                    return res.json({ success: true, data: [] });
                }
            } else {
                // If no identifying information found, return empty result
                console.log('❌ No identifying information found, returning empty task list');
                return res.json({ success: true, data: [] });
            }
        } else {
            console.log('🏢 Admin/HR user, returning all tasks');
        }

        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .populate("assignedTo", "name email _id");

        console.log(`✅ Found ${tasks.length} tasks for query:`, query);

        return res.json({ success: true, data: tasks });
    } catch (err) {
        console.error("getTasks error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/tasks/:id
export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate("assignedTo", "name email");
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });
        return res.json({ success: true, data: task });
    } catch (err) {
        console.error("getTaskById error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/tasks
export const createTask = async (req, res) => {
    try {
        console.log(`📝 Creating task with data:`, req.body);
        const created = await Task.create(req.body);
        const task = await Task.findById(created._id).populate("assignedTo", "name email _id");
        console.log(`✅ Task created successfully:`, { id: task._id, title: task.title, assignedTo: task.assignedTo });
        return res.status(201).json({ success: true, data: task });
    } catch (err) {
        console.error("createTask error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
    try {
        // Log the update operation for debugging
        console.log(`🔧 Updating task ${req.params.id} with data:`, req.body);

        const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate("assignedTo", "name email _id");

        if (!updated) {
            console.log(`❌ Task ${req.params.id} not found for update`);
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        console.log(`✅ Task updated successfully:`, { id: updated._id, title: updated.title, assignedTo: updated.assignedTo });
        return res.json({ success: true, data: updated });
    } catch (err) {
        console.error("updateTask error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Task not found" });
        return res.json({ success: true, message: "Deleted" });
    } catch (err) {
        console.error("deleteTask error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
