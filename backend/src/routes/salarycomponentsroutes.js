import { Router } from "express";
import {
    getSalaryComponents,
    createSalaryComponent,
    updateSalaryComponent,
    deleteSalaryComponent,
} from "../controllers/salarycontroller.js";

const router = Router();

router.get("/", getSalaryComponents);
router.post("/", createSalaryComponent);
router.put("/:id", updateSalaryComponent);
router.delete("/:id", deleteSalaryComponent);

export default router;
