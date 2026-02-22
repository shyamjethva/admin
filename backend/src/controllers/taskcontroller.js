import Task from "../models/Task.js";

// GET /api/tasks
export const getTasks = async (req, res) => {
    try {
        const { role, id } = req.user;
        let query = {};

        console.log(`🔍 getTasks called - User ID: ${id}, Role: ${role}`);

        // If user is not admin or hr, only show tasks assigned to them
        if (role !== 'admin' && role !== 'hr') {
            // Get the current user to access their email
            const User = await import('../models/User.js');
            const currentUser = await User.default.findById(id).select('email role name');

            console.log(`👤 Current user:`, JSON.stringify({
                id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role
            }, null, 2));

            if (currentUser && currentUser.email) {
                // Find employee by email
                console.log(`📧 Attempting email-based matching with: ${currentUser.email}`);
                const EmployeeModel = (await import('../models/Employee.js')).default;
                const employee = await EmployeeModel.findOne({ email: currentUser.email });

                console.log(`📧 Email match result:`, employee ? `Found employee: ${employee.name} (ID: ${employee._id})` : 'NOT FOUND');

                if (employee) {
                    // Match tasks assigned to this employee's ObjectId
                    const mongoose = await import('mongoose');
                    const possibleEmpIds = [employee._id];

                    // Also add string version for flexibility
                    possibleEmpIds.push(employee._id.toString());

                    query.assignedTo = { $in: possibleEmpIds };
                    console.log(`📋 Query using employee ID:`, possibleEmpIds);
                } else {
                    // If no matching employee found, return empty result
                    console.log('❌ No matching employee found, returning empty task list');
                    return res.json({ success: true, data: [] });
                }
            } else {
                // If no email found, return empty result
                console.log('❌ No email found for user, returning empty task list');
                return res.json({ success: true, data: [] });
            }
        } else {
            console.log('🏢 Admin/HR user, returning all tasks');
        }

        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .populate("assignedTo", "name email _id")
            .populate("assignedBy", "name email _id");

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
        const task = await Task.findById(req.params.id).populate("assignedTo", "name email _id").populate("assignedBy", "name email _id");
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

        // Set assignedBy to the current user's ID
        const taskData = {
            ...req.body,
            assignedBy: req.user.id  // Use the authenticated user's ID
        };

        const created = await Task.create(taskData);
        const task = await Task.findById(created._id).populate("assignedTo", "name email _id").populate("assignedBy", "name email _id");
        console.log(`✅ Task created successfully:`, { id: task._id, title: task.title, assignedTo: task.assignedTo, assignedBy: task.assignedBy });
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

        // Don't update assignedBy during task updates, keep original assigner
        const updateData = { ...req.body };
        delete updateData.assignedBy; // Prevent updating the assignedBy field

        const updated = await Task.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).populate("assignedTo", "name email _id").populate("assignedBy", "name email _id");

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
