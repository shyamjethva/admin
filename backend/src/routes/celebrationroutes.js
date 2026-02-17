import express from "express";
import {
    createCelebration,
    getCelebrations,
    getUpcomingCelebrations,
    updateCelebration,
    deleteCelebration,
} from "../controllers/celebrationcontroller.js";

import authmiddleware from "../middleware/authmiddleware.js";
// import rolemiddleware from "../middleware/rolemiddleware.js";

const router = express.Router();
router.use(authmiddleware);

router.post("/", createCelebration);
router.get("/", getCelebrations);
router.get("/upcoming/list", getUpcomingCelebrations);

router.put("/:id", updateCelebration);
router.delete("/:id", deleteCelebration);

export default router;
