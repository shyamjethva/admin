import mongoose from "mongoose";
import LeaveRequest from "../models/LeaveRequest.js";
import LeaveType from "../models/LeaveType.js";

// GET ALL
export const getLeaves = async (req, res) => {
    try {
        const data = await LeaveRequest.aggregate([
            {
                $lookup: {
                    from: "leavetypes",
                    localField: "leaveTypeId",
                    foreignField: "_id",
                    as: "leaveTypeInfo"
                }
            },
            {
                $addFields: {
                    leaveTypeName: {
                        $cond: {
                            if: { $gt: [{ $size: "$leaveTypeInfo" }, 0] },
                            then: { $arrayElemAt: ["$leaveTypeInfo.name", 0] },
                            else: "$leaveTypeName"
                        }
                    },
                    leaveTypeCode: {
                        $cond: {
                            if: { $gt: [{ $size: "$leaveTypeInfo" }, 0] },
                            then: { $arrayElemAt: ["$leaveTypeInfo.code", 0] },
                            else: "$leaveTypeCode"
                        }
                    }
                }
            },
            {
                $project: {
                    leaveTypeInfo: 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET BY ID
export const getLeaveById = async (req, res) => {
    try {
        const data = await LeaveRequest.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: "leavetypes",
                    localField: "leaveTypeId",
                    foreignField: "_id",
                    as: "leaveTypeInfo"
                }
            },
            {
                $addFields: {
                    leaveTypeName: {
                        $cond: {
                            if: { $gt: [{ $size: "$leaveTypeInfo" }, 0] },
                            then: { $arrayElemAt: ["$leaveTypeInfo.name", 0] },
                            else: "$leaveTypeName"
                        }
                    },
                    leaveTypeCode: {
                        $cond: {
                            if: { $gt: [{ $size: "$leaveTypeInfo" }, 0] },
                            then: { $arrayElemAt: ["$leaveTypeInfo.code", 0] },
                            else: "$leaveTypeCode"
                        }
                    }
                }
            },
            {
                $project: {
                    leaveTypeInfo: 0
                }
            }
        ]);

        if (!data || data.length === 0) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: data[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// CREATE
export const createLeave = async (req, res) => {
    try {
        const { leaveTypeId, ...body } = req.body;

        // Get the leave type to populate the code
        let leaveTypeCode = "";
        if (leaveTypeId) {
            const leaveType = await LeaveType.findById(leaveTypeId);
            if (leaveType) {
                leaveTypeCode = leaveType.code;
            }
        }

        const doc = await LeaveRequest.create({
            ...body,
            leaveTypeId,
            leaveTypeCode
        });

        res.json({ success: true, data: doc });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// UPDATE
export const updateLeave = async (req, res) => {
    try {
        const { leaveTypeId, ...body } = req.body;

        // Get the leave type to populate the code
        let leaveTypeCode = "";
        if (leaveTypeId) {
            const leaveType = await LeaveType.findById(leaveTypeId);
            if (leaveType) {
                leaveTypeCode = leaveType.code;
            }
        }

        const doc = await LeaveRequest.findByIdAndUpdate(req.params.id, {
            ...body,
            leaveTypeId,
            leaveTypeCode
        }, { new: true });

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
