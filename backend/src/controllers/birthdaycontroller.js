import Birthday from "../models/Birthday.js";

export const createBirthday = async (req, res) => {
    try {
        const payload = { ...req.body, createdBy: req.user?.id };
        const item = await Birthday.create(payload);
        res.status(201).json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getBirthdays = async (req, res) => {
    try {
        const { isActive, month, year, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === "true";

        if (month && year) {
            const m = Number(month) - 1;
            const y = Number(year);
            const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
            const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
            filter.date = { $gte: start, $lt: end };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            Birthday.find(filter)
                .populate("user", "name email role")
                .populate("createdBy", "name email role")
                .sort({ date: 1 })
                .skip(skip)
                .limit(Number(limit)),
            Birthday.countDocuments(filter),
        ]);

        res.json({
            success: true,
            items,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUpcomingBirthdays = async (req, res) => {
    try {
        const days = Number(req.query.days || 30);
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);

        const items = await Birthday.find({
            isActive: true,
            date: { $gte: start, $lte: end },
        })
            .populate("user", "name email role")
            .populate("createdBy", "name email role")
            .sort({ date: 1 });

        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateBirthday = async (req, res) => {
    try {
        const item = await Birthday.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })
            .populate("user", "name email role")
            .populate("createdBy", "name email role");

        if (!item) return res.status(404).json({ success: false, message: "Birthday not found" });
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteBirthday = async (req, res) => {
    try {
        const item = await Birthday.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Birthday not found" });
        res.json({ success: true, message: "Birthday deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
