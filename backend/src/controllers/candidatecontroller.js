import Candidate from "../models/Candidate.js";

export const getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find()
            .populate("jobId", "title status") // ✅ title fetch
            .sort({ createdAt: -1 });

        res.json({ success: true, data: candidates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const createCandidate = async (req, res) => {
    try {
        const { jobId, name, email, phone, experience, status, appliedDate } = req.body;

        if (!jobId) return res.status(400).json({ success: false, message: "jobId is required" });
        if (!name || !email || !phone) return res.status(400).json({ success: false, message: "name/email/phone required" });
        if (!experience) return res.status(400).json({ success: false, message: "experience is required" });

        const candidate = await Candidate.create({
            jobId,
            name,
            email,
            phone,
            experience,
            status,
            appliedDate,
        });

        const populated = await Candidate.findById(candidate._id).populate("jobId", "title status");

        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateCandidate = async (req, res) => {
    try {
        const updated = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate("jobId", "title status");

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteCandidate = async (req, res) => {
    try {
        await Candidate.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Candidate deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
