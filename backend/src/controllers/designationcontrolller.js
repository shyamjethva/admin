import Designation from "../models/Designation.js";

// Create designation
export const createDesignation = async (req, res) => {
    try {
        const { name, departmentId, level, description } = req.body;

        const designation = await Designation.create({
            name,
            departmentId,
            level,
            description,
        });

        res.status(201).json({
            success: true,
            data: designation,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// Get all designations
export const getDesignations = async (req, res) => {
    const designations = await Designation.find()
        .populate("departmentId", "name")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: designations,
    });
};

// Update designation
export const updateDesignation = async (req, res) => {
    const updated = await Designation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json({
        success: true,
        data: updated,
    });
};

// Delete designation
export const deleteDesignation = async (req, res) => {
    await Designation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};
