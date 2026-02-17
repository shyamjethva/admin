import express from "express";
import {
    getCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
} from "../controllers/candidatecontroller.js";

const router = express.Router();

router.get("/", getCandidates);
router.post("/", createCandidate);
router.put("/:id", updateCandidate);
router.delete("/:id", deleteCandidate);

export default router;
