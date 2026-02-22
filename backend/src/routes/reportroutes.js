import { Router } from "express";
import { protect, authorize } from "../middleware/authmiddleware.js";
import { createReport, getReports, getReportById, deleteReport } from "../controllers/reportcontroller.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Create a new report (POST /api/reports)
router.post('/', createReport);

// Get all reports (GET /api/reports)
router.get('/', getReports);

// Get report by ID (GET /api/reports/:id)
router.get('/:id', getReportById);

// Delete report (DELETE /api/reports/:id)
router.delete('/:id', authorize('admin', 'hr'), deleteReport);

export default router;