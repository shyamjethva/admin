import ChatMessage from "../models/whatchat.js";

// GET /api/chat?limit=100
export const getChatMessages = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);

        const messages = await ChatMessage.find({ isActive: true })
            .sort({ timestamp: 1 }) // oldest -> newest for UI
            .limit(limit);

        return res.json({ success: true, data: messages });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/chat
export const createChatMessage = async (req, res) => {
    console.log("CHAT BODY:", req.body);

    try {
        const { userId, userName, userRole, message, timestamp, file, department, isPrivate } = req.body;

        if (!userId || !userName || !userRole) {
            return res
                .status(400)
                .json({ success: false, message: "userId, userName, userRole are required" });
        }

        // basic size guard (client already checks, but still)
        if (file?.dataUrl && file?.size && file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: "File must be <= 10MB" });
        }

        const doc = await ChatMessage.create({
            userId,
            userName,
            userRole,
            message: message || "",
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            file: file || null,
            department: department || "",
            isPrivate: !!isPrivate,
            isActive: true,
        });

        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
