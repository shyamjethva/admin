import Candidate from "../models/Candidate.js";

export const updateCandidateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
};
