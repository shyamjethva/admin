import Celebration from "../models/Celebration.js";

export const createCelebration = async (req, res) => {
    try {
        const payload = { ...req.body, createdBy: req.user?.id };
        const item = await Celebration.create(payload);
        res.status(201).json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getCelebrations = async (req, res) => {
    try {
        const { type, isActive, month, year, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (type) filter.type = type;
        if (isActive !== undefined) filter.isActive = isActive === "true";

        // optional month/year filtering
        if (month && year) {
            const m = Number(month) - 1;
            const y = Number(year);
            const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
            const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
            filter.date = { $gte: start, $lt: end };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            Celebration.find(filter)
                .populate("user", "name email role")
                .sort({ date: 1 })
                .skip(skip)
                .limit(Number(limit)),
            Celebration.countDocuments(filter),
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

export const getUpcomingCelebrations = async (req, res) => {
    try {
        const days = Number(req.query.days || 30);

        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);

        const items = await Celebration.find({
            isActive: true,
            date: { $gte: start, $lte: end },
        })
            .populate("user", "name email role")
            .sort({ date: 1 });

        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateCelebration = async (req, res) => {
    try {
        const item = await Celebration.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate("user", "name email role");

        if (!item) return res.status(404).json({ success: false, message: "Celebration not found" });
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteCelebration = async (req, res) => {
    try {
        const item = await Celebration.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Celebration not found" });
        res.json({ success: true, message: "Celebration deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
