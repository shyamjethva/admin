import Client from "../models/Client.js";
import mongoose from "mongoose";


export const getClients = async (req, res) => {
    try {
        const dbName = mongoose.connection.name;
        const collectionName = Client.collection.name;
        const count = await Client.countDocuments();
        const items = await Client.find().sort({ createdAt: -1 });

        console.log("✅ GET /clients =>", { dbName, collectionName, count });

        return res.json({ success: true, meta: { dbName, collectionName, count }, data: items });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const createClient = async (req, res) => {
    try {

        const dbName = mongoose.connection.name;
        const collectionName = Client.collection.name;
        console.log("✅ POST /clients =>", { dbName, collectionName });

        // ✅ accept both: (company/contactPerson) OR (name/contactPerson) OR (name + company)
        const payload = { ...req.body };

        // if frontend sends name as company by mistake
        if (!payload.company && payload.name) payload.company = payload.name;

        // if frontend sends name as contactPerson (common)
        if (!payload.contactPerson && payload.contactPersonName) payload.contactPerson = payload.contactPersonName;

        const created = await Client.create(payload);
        return res.status(201).json({ success: true, data: created });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

export const updateClient = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (!payload.company && payload.name) payload.company = payload.name;

        const updated = await Client.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Client not found" });

        return res.json({ success: true, data: updated });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteClient = async (req, res) => {
    try {
        const deleted = await Client.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Client not found" });
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
