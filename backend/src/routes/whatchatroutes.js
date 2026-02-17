import { Router } from "express";
import { getChatMessages, createChatMessage } from "../controllers/whatchatcontroller.js";

// OPTIONAL: if you have auth middleware, enable these lines
// import authmiddleware from "../middleware/authmiddleware.js";

const router = Router();

// If you want protected routes, do this:
// router.use(authmiddleware);

router.get("/", getChatMessages);
router.post("/", createChatMessage);

export default router;
