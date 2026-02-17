import Notification from "../models/Notification.js";

export const createNotification = async (req, res) => {
    try {
        // Admin/HR can create; (you can enforce via rolemiddleware on route)
        const payload = {
            title: req.body.title,
            message: req.body.message,
            type: req.body.type || "info",
            recipient: req.body.recipient || null,
            roleTarget: req.body.roleTarget || "all",
            meta: req.body.meta || {},
            createdBy: req.user?.id,
        };

        const item = await Notification.create(payload);
        res.status(201).json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, unreadOnly } = req.query;

        const filter = {
            $or: [
                { recipient: req.user.id },
                { roleTarget: "all" },
                { roleTarget: req.user.role },
            ],
        };

        if (unreadOnly === "true") filter.isRead = false;

        const skip = (Number(page) - 1) * Number(limit);

        const [items, total, unreadCount] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Notification.countDocuments(filter),
            Notification.countDocuments({ ...filter, isRead: false }),
        ]);

        res.json({
            success: true,
            items,
            unreadCount,
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

export const markNotificationRead = async (req, res) => {
    try {
        const item = await Notification.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Notification not found" });

        // safety: only allow read if belongs to user or roleTarget
        const allowed =
            (item.recipient && String(item.recipient) === String(req.user.id)) ||
            item.roleTarget === "all" ||
            item.roleTarget === req.user.role;

        if (!allowed) return res.status(403).json({ success: false, message: "Not allowed" });

        item.isRead = true;
        item.readAt = new Date();
        await item.save();

        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const filter = {
            isRead: false,
            $or: [
                { recipient: req.user.id },
                { roleTarget: "all" },
                { roleTarget: req.user.role },
            ],
        };

        await Notification.updateMany(filter, { $set: { isRead: true, readAt: new Date() } });

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        // only admin ideally (use rolemiddleware)
        const item = await Notification.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Notification not found" });
        res.json({ success: true, message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
