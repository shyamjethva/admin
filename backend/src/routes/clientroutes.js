import { Router } from "express";
import { getClients, createClient, updateClient, deleteClient } from "../controllers/clientController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = Router();

// ✅ Protect all client routes with authentication
router.use(protect);

router.get("/", getClients);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
