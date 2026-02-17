import Payroll from "../models/Payroll.js";
import mongoose from "mongoose";

const calcNet = (basicSalary = 0, allowances = 0, deductions = 0) =>
    Number(basicSalary || 0) + Number(allowances || 0) - Number(deductions || 0);

export const getPayrolls = async (req, res) => {
    try {
        const items = await Payroll.find().sort({ createdAt: -1 });
        return res.json(items);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// export const createPayroll = async (req, res) => {
//     try {
//         const body = req.body || {};

//         if (!body.employeeId) return res.status(400).json({ success: false, message: "employeeId is required" });
//         if (!body.employeeName) return res.status(400).json({ success: false, message: "employeeName is required" });
//         if (!body.month) return res.status(400).json({ success: false, message: "month is required" });

//         const netSalary = calcNet(body.basicSalary, body.allowances, body.deductions);

//         const created = await Payroll.create({
//             employeeId: body.employeeId,
//             employeeName: body.employeeName,
//             month: body.month,
//             basicSalary: Number(body.basicSalary || 0),
//             allowances: Number(body.allowances || 0),
//             deductions: Number(body.deductions || 0),
//             netSalary,
//             status: body.status || "pending",
//         });

//         return res.status(201).json(created);
//     } catch (err) {
//         // duplicate (employeeId+month)
//         if (err?.code === 11000) {
//             return res.status(409).json({ success: false, message: "Payroll already exists for this employee & month" });
//         }
//         return res.status(500).json({ success: false, message: err.message });
//     }
// };

export const createPayroll = async (req, res) => {
    try {
        const { employeeId, month } = req.body;

        if (!employeeId || !month) {
            return res.status(400).json({ success: false, message: "employeeId and month are required" });
        }

        // ✅ ObjectId validation (THIS WILL FIX 500)
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employeeId (must be Mongo ObjectId).",
            });
        }

        const exists = await Payroll.findOne({ employeeId, month }).lean();
        if (exists) {
            return res.status(409).json({ success: false, message: "Payroll already exists for this employee & month" });
        }

        const created = await Payroll.create({
            ...req.body,
            employeeId: new mongoose.Types.ObjectId(employeeId), // ✅ ensure cast
        });

        return res.status(201).json({ success: true, data: created });
    } catch (e) {
        console.error("createPayroll error:", e);
        return res.status(500).json({ success: false, message: e.message || "Server error" });
    }
};



export const updatePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body || {};

        const existing = await Payroll.findById(id);
        if (!existing) return res.status(404).json({ success: false, message: "Payroll not found" });

        const basicSalary = body.basicSalary ?? existing.basicSalary;
        const allowances = body.allowances ?? existing.allowances;
        const deductions = body.deductions ?? existing.deductions;

        const netSalary = calcNet(basicSalary, allowances, deductions);

        const updated = await Payroll.findByIdAndUpdate(
            id,
            {
                ...body,
                basicSalary: Number(basicSalary || 0),
                allowances: Number(allowances || 0),
                deductions: Number(deductions || 0),
                netSalary,
            },
            { new: true }
        );

        return res.json(updated);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const deletePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        await Payroll.findByIdAndDelete(id);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
