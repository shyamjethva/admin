import express from "express";
import authmiddleware from "../middleware/authmiddleware.js";
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from "../controllers/taskcontroller.js";

const router = express.Router();

router.use(authmiddleware);

// CRUD
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
