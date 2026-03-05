import express from "express";
import {
    createBirthday,
    getBirthdays,
    getUpcomingBirthdays,
    updateBirthday,
    deleteBirthday,
} from "../controllers/birthdaycontroller.js";

import authmiddleware from "../middleware/authmiddleware.js";

const router = express.Router();
router.use(authmiddleware);

router.post("/", createBirthday);
router.get("/", getBirthdays);
router.get("/upcoming/list", getUpcomingBirthdays);

router.put("/:id", updateBirthday);
router.delete("/:id", deleteBirthday);

export default router;
