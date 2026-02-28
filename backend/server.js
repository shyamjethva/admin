import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
// Removed auto-mark absent functionality - only create records when employees clock in/out

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
    console.log('✅ User connected:', socket.id);

    // Verify authentication token
    const token = socket.handshake.auth.token;
    if (!token) {
        console.log('❌ No token provided for socket connection');
        socket.disconnect();
        return;
    }

    try {
        const { verifyToken } = await import('./src/utils/jwt.js');
        const decoded = verifyToken(token);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.userName = decoded.name; // Store user name

        // Add user to online users
        socket.join('online_users');

        // Update online users list
        const onlineUsers = [];
        for (let [id, socketInfo] of io.sockets.adapter.rooms.get('online_users') || []) {
            if (io.sockets.sockets.get(id)?.userId && io.sockets.sockets.get(id)?.userName) {
                onlineUsers.push({
                    id: io.sockets.sockets.get(id).userId,
                    name: io.sockets.sockets.get(id).userName,
                    role: io.sockets.sockets.get(id).userRole
                });
            }
        }

        console.log(`✅ Authenticated user connected: ${socket.userId} (${socket.userRole}) - Total online: ${onlineUsers.length}`);

        // Notify all users about updated online users list
        io.emit('online_users_update', onlineUsers);
    } catch (err) {
        console.log('❌ Invalid token for socket connection:', err.message);
        socket.disconnect();
        return;
    }

    // Join a chat room
    socket.on('join_chat', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined chat: ${conversationId}`);
    });

    // Listen for new messages
    socket.on('new_message', (messageData) => {
        const { conversationId, senderId, receiverId, message, createdAt } = messageData;

        // Emit to specific conversation room
        io.to(conversationId).emit('new_message', {
            conversationId,
            senderId,
            receiverId,
            message,
            createdAt
        });

        // Emit to receiver specifically (for notifications)
        if (receiverId) {
            io.to(receiverId).emit('notification', {
                type: 'new_message',
                message,
                senderId,
                senderName: messageData.senderName || 'User',
                conversationId,
                createdAt
            });
        }
    });

    // Handle general chat message broadcast
    socket.on('chat_message_broadcast', (messageData) => {
        console.log('Broadcasting chat message to all users:', messageData);

        // Emit to all connected clients except sender
        socket.broadcast.emit('new_message', {
            conversationId: messageData.conversationId || 'general',
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            message: messageData.message,
            createdAt: messageData.createdAt
        });

        // Emit notification to all users except sender
        socket.broadcast.emit('notification', {
            type: 'new_message',
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            message: messageData.message,
            conversationId: messageData.conversationId || 'general',
            createdAt: messageData.createdAt
        });
    });

    // Handle direct notification events
    socket.on('send_notification', (notificationData) => {
        const { userId, message, senderName } = notificationData;

        // Emit notification to specific user
        io.to(userId).emit('notification', {
            type: 'new_message',
            message,
            senderId: 'system',
            senderName: senderName || 'System',
            conversationId: 'general',
            createdAt: new Date().toISOString()
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);

        // Update online users list
        setTimeout(() => { // Small delay to ensure socket is properly removed
            const onlineUsers = [];
            for (let [id, socketInfo] of io.sockets.adapter.rooms.get('online_users') || []) {
                const s = io.sockets.sockets.get(id);
                if (s?.userId && s?.userName) {
                    onlineUsers.push({
                        id: s.userId,
                        name: s.userName,
                        role: s.userRole
                    });
                }
            }

            console.log(`User disconnected: ${socket.id} - Total online: ${onlineUsers.length}`);

            // Notify all users about updated online users list
            io.emit('online_users_update', onlineUsers);
        }, 100);
    });
});

// Store online users
app.set('io', io);

await connectDB();

// Removed auto-mark absent cron job
// Attendance records will only be created when employees actually clock in/out

httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});