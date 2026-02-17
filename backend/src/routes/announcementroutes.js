import { Router } from "express";
import Announcement from "../models/Announcement.js";
import { protect } from "../middleware/authmiddleware.js";
import { allowRoles } from "../middleware/rolemiddleware.js";
import { createCrud } from "../controllers/crudfactory.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Create CRUD operations
const crud = createCrud(Announcement, "createdBy");

// GET /announcements - Allow all authenticated users to read
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = { isActive: true };

        // For employees, filter by audience and department
        if (userRole === 'employee') {
            query = {
                ...query,
                $or: [
                    { audience: 'all' },
                    { audience: 'employee' },
                    {
                        audience: 'department',
                        department: req.user.department
                    }
                ]
            };
        }

        const announcements = await Announcement.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /announcements/:id - Allow all authenticated users to read single announcement
router.get("/:id", async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        // Check if user has access to this announcement
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole === 'employee') {
            const audience = announcement.audience || 'all';
            if (audience === 'hr' && userRole !== 'hr') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            if (audience === 'department' && announcement.department !== req.user.department) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        res.json({
            success: true,
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /announcements - Admin/HR only
router.post("/", allowRoles("admin", "hr"), crud.create);

// PUT /announcements/:id - Admin/HR only
router.put("/:id", allowRoles("admin", "hr"), crud.update);

// DELETE /announcements/:id - Admin/HR only
router.delete("/:id", allowRoles("admin", "hr"), crud.remove);

export default router;
