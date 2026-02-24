import express from "express";
import auth from "../middleware/authmiddleware.js";
import { createLeaveType, getLeaveTypes, updateLeaveType, deleteLeaveType } from "../controllers/leavetypecontroller.js";

const router = express.Router();

router.get("/", auth, getLeaveTypes);
router.post("/", auth, createLeaveType);
router.put("/:id", auth, updateLeaveType);
router.delete("/:id", auth, deleteLeaveType);

export default router;
