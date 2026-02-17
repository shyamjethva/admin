import LeaveType from "../models/LeaveType.js";
import LeaveRequest from "../models/LeaveRequest.js";

// GET ALL
export const getLeaveTypes = async (req, res) => {
    try {
        const list = await LeaveType.find().sort({ createdAt: -1 });
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// CREATE
export const createLeaveType = async (req, res) => {
    try {
        const { name, code, description, maxDays, isPaid, status } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "name and code are required",
            });
        }

        const normalizedCode = String(code).trim().toUpperCase();

        const exists = await LeaveType.findOne({ code: normalizedCode });
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Leave type code already exists",
            });
        }

        const doc = await LeaveType.create({
            name,
            code: normalizedCode,
            description,
            maxDays,
            isPaid,
            status,
        });

        res.json({ success: true, data: doc });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// UPDATE
export const updateLeaveType = async (req, res) => {
    try {
        const { name, code, description, maxDays, isPaid, status } = req.body;

        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "name and code are required",
            });
        }

        const normalizedCode = String(code).trim().toUpperCase();

        // Check if another leave type already has this code (excluding current)
        const exists = await LeaveType.findOne({
            code: normalizedCode,
            _id: { $ne: req.params.id }
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Leave type code already exists",
            });
        }

        const doc = await LeaveType.findByIdAndUpdate(
            req.params.id,
            {
                name,
                code: normalizedCode,
                description,
                maxDays,
                isPaid,
                status,
            },
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Leave type not found",
            });
        }

        res.json({ success: true, data: doc });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE
export const deleteLeaveType = async (req, res) => {
    try {
        const doc = await LeaveType.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Leave type not found",
            });
        }

        res.json({ success: true, message: "Leave type deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
