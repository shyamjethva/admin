export const createCrud = (Model, populate = "") => ({
    create: async (req, res) => {
        try {
            const doc = await Model.create(req.body);
            res.json({ success: true, data: doc, message: "Created successfully" });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    list: async (req, res) => {
        try {
            const q = req.query || {};
            const docs = await Model.find(q).populate(populate).sort({ createdAt: -1 });
            res.json({ success: true, data: docs, message: "Retrieved successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    get: async (req, res) => {
        try {
            const doc = await Model.findById(req.params.id).populate(populate);
            if (!doc) return res.status(404).json({ success: false, message: "Not found" });
            res.json({ success: true, data: doc, message: "Retrieved successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!doc) return res.status(404).json({ success: false, message: "Not found" });
            res.json({ success: true, data: doc, message: "Updated successfully" });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    remove: async (req, res) => {
        try {
            const doc = await Model.findByIdAndDelete(req.params.id);
            if (!doc) return res.status(404).json({ success: false, message: "Not found" });
            res.json({ success: true, message: "Deleted successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});
