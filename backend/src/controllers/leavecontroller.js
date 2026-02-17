import LeaveRequest from "../models/LeaveRequest.js";

// GET ALL
export const getLeaves = async (req, res) => {
    try {
        const data = await LeaveRequest.find().sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET BY ID
export const getLeaveById = async (req, res) => {
    try {
        const data = await LeaveRequest.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// CREATE
export const createLeave = async (req, res) => {
    try {
        const doc = await LeaveRequest.create(req.body);
        res.json({ success: true, data: doc });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// UPDATE
export const updateLeave = async (req, res) => {
    try {
        const doc = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: doc });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE
export const deleteLeave = async (req, res) => {
    try {
        const doc = await LeaveRequest.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
