import { Router } from "express";
import { getPayrolls, createPayroll, updatePayroll, deletePayroll } from "../controllers/payrollcontroller.js";

const router = Router();

router.get("/", getPayrolls);
router.post("/", createPayroll);
router.put("/:id", updatePayroll);
router.delete("/:id", deletePayroll);

export default router;
