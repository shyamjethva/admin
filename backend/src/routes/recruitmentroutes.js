import Job from "../models/jobs.js";
import Candidate from "../models/Candidate.js";
import { createCrud } from "../controllers/crudfactory.js";
import { makeCrudRouter } from "./crudroutes.js";
import { Router } from "express";
import { protect } from "../middleware/authmiddleware.js";
import { allowRoles } from "../middleware/rolemiddleware.js";
import { updateCandidateStatus } from "../controllers/recruitmentcontroller.js";

const router = Router();

// CRUD
router.use("/jobs", makeCrudRouter(createCrud(Job), ["admin", "hr"]));
router.use("/candidates", makeCrudRouter(createCrud(Candidate, "jobId"), ["admin", "hr"]));

// Status update
router.patch(
    "/candidates/:id/status",
    protect,
    allowRoles("admin", "hr"),
    updateCandidateStatus
);

export default router;
