import Interview from "../models/Interview.js";

export const getInterviews = async (req, res) => {
    const list = await Interview.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
};

export const createInterview = async (req, res) => {
    const created = await Interview.create(req.body);
    res.status(201).json({ success: true, data: created });
};

export const updateInterview = async (req, res) => {
    const updated = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
};

export const deleteInterview = async (req, res) => {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "deleted" });
};
