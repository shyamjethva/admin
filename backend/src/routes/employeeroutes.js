import { Router } from "express";
import Employee from "../models/Employee.js";
import { createCrud } from "../controllers/crudfactory.js";
import { makeCrudRouter } from "./crudroutes.js";
import { protect } from "../middleware/authmiddleware.js";
import { allowRoles } from "../middleware/rolemiddleware.js";

const crud = createCrud(Employee, "departmentId designationId");

// Create router with restricted write access but open read access
const employeeRouter = Router();
employeeRouter.use(protect);

// Allow all authenticated users to read employees (needed for task filtering)
employeeRouter.get("/", crud.list);
employeeRouter.get("/:id", crud.get);

// Restrict write operations to admin/HR only
employeeRouter.post("/", allowRoles("admin", "hr"), crud.create);
employeeRouter.put("/:id", allowRoles("admin", "hr"), crud.update);
employeeRouter.delete("/:id", allowRoles("admin", "hr"), crud.remove);

// Add custom route for updating profile image
employeeRouter.post('/update-image', async (req, res) => {
    try {
        console.log('📸 Update image route hit:', req.body);
        const { employeeId, profileImage } = req.body;

        if (!employeeId) {
            return res.status(400).json({ success: false, message: 'Employee ID is required' });
        }

        const updated = await Employee.findByIdAndUpdate(
            employeeId,
            { profileImage },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        console.log('✅ Profile image updated for:', employeeId);
        res.json({ success: true, data: updated, message: 'Profile image updated' });
    } catch (error) {
        console.error('❌ Error updating profile image:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default employeeRouter;
