import ChatMessage from "../models/whatchat.js";
import ChatNotificationController from './chatnotificationcontroller.js';

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
    console.log("📥 CHAT BODY:", req.body);
    console.log("📥 User from request:", req.user);

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

        console.log("✅ Message created:", doc);

        // Create persistent notifications for recipients
        try {
            console.log("📧 Creating notifications for recipients...");
            await ChatNotificationController.createNotification({
                senderId: userId,
                senderName: userName,
                senderRole: userRole,
                message: message || "",
                messageId: doc._id,
                conversationId: 'general',
                type: 'message',
                priority: 'medium'
            });
            console.log("✅ Notifications created successfully");
        } catch (notificationErr) {
            console.error('❌ Notification creation error:', notificationErr);
        }

        // Emit socket event for real-time notifications
        try {
            const io = req.app.get('io');
            if (io) {
                console.log("📡 Emitting socket events...");

                // Emit 'new_message' for real-time chat UI updates
                io.emit('new_message', {
                    conversationId: 'general',
                    senderId: userId,
                    senderName: userName,
                    message: message || "",
                    createdAt: doc.timestamp || new Date().toISOString()
                });
                console.log("✅ 'new_message' event emitted");

                // Get recipients for this message to emit notifications to them
                const recipients = await ChatNotificationController.getRecipients(userRole, 'general');

                console.log(`📬 Message from ${userName} (${userRole}): Found ${recipients.length} recipients:`, recipients.map(r => `${r.name} (${r.role})`));

                // Debug: Show all currently connected users
                const allConnectedUsers = Object.values(io.sockets.sockets).map(socket => ({
                    id: socket.id,
                    userId: socket.userId,
                    userName: socket.userName,
                    userRole: socket.userRole
                }));
                console.log(`👥 Currently connected users:`, allConnectedUsers);

                // Emit 'chat_notification' for popup notifications to specific recipients
                recipients.forEach(recipient => {
                    // Check if recipient is connected
                    const connectedSockets = Object.values(io.sockets.sockets).filter(socket =>
                        socket.userId === recipient._id.toString()
                    );

                    console.log(`🔌 Found ${connectedSockets.length} connected sockets for recipient ${recipient.name} (${recipient._id})`);

                    if (connectedSockets.length === 0) {
                        console.log(`⚠️  No connected sockets found for ${recipient.name} (${recipient._id}) - user might be offline`);
                    }

                    connectedSockets.forEach(socket => {
                        socket.emit('chat_notification', {
                            type: 'message',
                            senderId: userId,
                            senderName: userName,
                            senderRole: userRole,
                            message: message || "",
                            conversationId: 'general',
                            createdAt: doc.timestamp || new Date().toISOString(),
                            messageId: doc._id
                        });
                        console.log(`✅ Sent chat_notification to ${recipient.name} (${socket.id})`);
                    });
                });

                // Note: Sender receives notifications through the general chat UI update, not separate notification

                console.log(`✅ 'chat_notification' event emitted to ${recipients.length} recipients (${recipients.map(r => r.name).join(', ')})`);
            } else {
                console.log("❌ Socket.io not available");
            }
        } catch (socketErr) {
            console.error('❌ Socket emit error:', socketErr);
        }

        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        console.error("❌ Create message error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};