import express from "express";
import {
    getAllAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
} from "../controllers/attendancecontroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// /api/attendance
router.get("/", protect, getAllAttendance);
router.post("/", protect, createAttendance);
router.put("/:id", protect, updateAttendance);
router.delete("/:id", protect, deleteAttendance);
// Removed mark-absent route - attendance records are only created when employees clock in/out

export default router;