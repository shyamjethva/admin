import express from "express";
import {
    clockIn,
    clockOut,
    breakIn,
    breakOut,
    getTodayAttendance,
    getWeeklyAttendance,
    getAllAttendanceRecords
} from "../controllers/clockcontroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Clock in/out routes
router.post("/clock-in", protect, clockIn);
router.post("/clock-out", protect, clockOut);

// Break in/out routes
router.post("/break-in", protect, breakIn);
router.post("/break-out", protect, breakOut);

// Get attendance records
router.get("/today/:employeeId", protect, getTodayAttendance);
router.get("/weekly/:employeeId", protect, getWeeklyAttendance);
router.get("/", protect, getAllAttendanceRecords);

export default router;