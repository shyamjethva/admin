import express from "express";
import {
    createNotification,
    getMyNotifications,
    markNotificationRead,
    markAllRead,
    deleteNotification,
} from "../controllers/notificationcontroller.js";

import authmiddleware from "../middleware/authmiddleware.js";
// import rolemiddleware from "../middleware/rolemiddleware.js";

const router = express.Router();
router.use(authmiddleware);

// user reads
router.get("/me", getMyNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/me/read-all", markAllRead);

// admin/hr creates (you can add rolemiddleware here)
router.post("/", createNotification);

// admin delete (optional)
router.delete("/:id", deleteNotification);

export default router;
