import SalaryComponent from "../models/SalaryComponent.js";

export const getSalaryComponents = async (req, res) => {
    try {
        const items = await SalaryComponent.find().sort({ createdAt: -1 });
        return res.json(items);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const createSalaryComponent = async (req, res) => {
    try {
        const body = req.body || {};

        if (!body.name) return res.status(400).json({ success: false, message: "name is required" });
        if (!body.type) return res.status(400).json({ success: false, message: "type is required" });

        const created = await SalaryComponent.create({
            name: String(body.name).trim(),
            type: body.type,
            amount: Number(body.amount || 0),
            isPercentage: Boolean(body.isPercentage),
            description: String(body.description || ""),
        });

        return res.status(201).json(created);
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ success: false, message: "Component already exists" });
        }
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updateSalaryComponent = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body || {};

        const updated = await SalaryComponent.findByIdAndUpdate(
            id,
            {
                ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
                ...(body.type !== undefined ? { type: body.type } : {}),
                ...(body.amount !== undefined ? { amount: Number(body.amount || 0) } : {}),
                ...(body.isPercentage !== undefined ? { isPercentage: Boolean(body.isPercentage) } : {}),
                ...(body.description !== undefined ? { description: String(body.description || "") } : {}),
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: "Salary component not found" });
        return res.json(updated);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteSalaryComponent = async (req, res) => {
    try {
        const { id } = req.params;
        await SalaryComponent.findByIdAndDelete(id);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
