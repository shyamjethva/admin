import express from "express";
import { getInterviews, createInterview, updateInterview, deleteInterview } from "../controllers/interviewcontroller.js";

const router = express.Router();

router.get("/", getInterviews);
router.post("/", createInterview);
router.put("/:id", updateInterview);
router.delete("/:id", deleteInterview);

export default router;
