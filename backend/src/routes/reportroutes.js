import { Router } from "express";
import { protect } from "../middleware/authmiddleware.js";
import { allowRoles } from "../middleware/rolemiddleware.js";
import { dashboardStats } from "../controllers/reportcontroller.js";

const router = Router();

router.use(protect);
router.get("/dashboard", allowRoles("admin", "hr"), dashboardStats);

export default router;
