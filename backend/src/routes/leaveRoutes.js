import express from "express";
import auth from "../middleware/authmiddleware.js";
import {
    getLeaves,
    createLeave,
    getLeaveById,
    updateLeave,
    deleteLeave,
} from "../controllers/leavecontroller.js";

const router = express.Router();

router.get("/", auth, getLeaves);
router.post("/", auth, createLeave);
router.get("/:id", auth, getLeaveById);
router.put("/:id", auth, updateLeave);
router.delete("/:id", auth, deleteLeave);

export default router;
