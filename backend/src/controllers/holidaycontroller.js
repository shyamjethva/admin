import Holiday from "../models/Holiday.js";

export const createHoliday = async (req, res) => {
    try {
        const payload = { ...req.body, createdBy: req.user?.id };
        const item = await Holiday.create(payload);
        res.status(201).json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getHolidays = async (req, res) => {
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
            Holiday.find(filter)
                .populate("createdBy", "name email role")
                .sort({ date: 1 })
                .skip(skip)
                .limit(Number(limit)),
            Holiday.countDocuments(filter),
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

export const getUpcomingHolidays = async (req, res) => {
    try {
        const days = Number(req.query.days || 30);
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);

        const items = await Holiday.find({
            isActive: true,
            date: { $gte: start, $lte: end },
        })
            .populate("createdBy", "name email role")
            .sort({ date: 1 });

        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateHoliday = async (req, res) => {
    try {
        const item = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate("createdBy", "name email role");

        if (!item) return res.status(404).json({ success: false, message: "Holiday not found" });
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteHoliday = async (req, res) => {
    try {
        const item = await Holiday.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Holiday not found" });
        res.json({ success: true, message: "Holiday deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
