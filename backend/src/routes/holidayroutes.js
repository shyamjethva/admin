import express from "express";
import {
    createHoliday,
    getHolidays,
    getUpcomingHolidays,
    updateHoliday,
    deleteHoliday,
} from "../controllers/holidaycontroller.js";

import authmiddleware from "../middleware/authmiddleware.js";

const router = express.Router();
router.use(authmiddleware);

router.post("/", createHoliday);
router.get("/", getHolidays);
router.get("/upcoming/list", getUpcomingHolidays);

router.put("/:id", updateHoliday);
router.delete("/:id", deleteHoliday);

export default router;
