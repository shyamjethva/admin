import express from "express";
import {
    getAllAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    markAbsentEmployees,
} from "../controllers/attendancecontroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// /api/attendance
router.get("/", protect, getAllAttendance);
router.post("/", protect, createAttendance);
router.put("/:id", protect, updateAttendance);
router.delete("/:id", protect, deleteAttendance);
router.post("/mark-absent", protect, markAbsentEmployees);

export default router;
