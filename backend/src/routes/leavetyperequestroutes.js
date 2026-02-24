import express from "express";
import auth from "../middleware/authmiddleware.js";
import {
    getLeaveTypes,
    createLeaveType,
} from "../controllers/leavetypecontroller.js";

const router = express.Router();

router.get("/", auth, getLeaveTypes);
router.post("/", auth, createLeaveType);

export default router;
