import ChatNotification from "../models/ChatNotification.js";
import User from "../models/User.js";

class ChatNotificationController {
    // Create notification for recipients based on role-based routing
    static async createNotification(messageData) {
        try {
            const { senderId, senderName, senderRole, message, messageId, conversationId } = messageData;

            // Get all potential recipients based on role-based routing
            const recipients = await this.getRecipients(senderRole, conversationId);

            // Filter out sender from recipients
            const notificationRecipients = recipients.filter(recipient =>
                recipient._id.toString() !== senderId.toString()
            );

            // Create notifications for each recipient
            const notifications = await Promise.all(
                notificationRecipients.map(async (recipient) => {
                    const notification = new ChatNotification({
                        userId: recipient._id,
                        senderId,
                        senderName,
                        senderRole,
                        message: message.substring(0, 100), // Truncate for preview
                        messageId,
                        conversationId,
                        type: messageData.type || 'message',
                        priority: messageData.priority || 'medium'
                    });

                    return await notification.save();
                })
            );

            console.log(`Created ${notifications.length} notifications for message ${messageId}`);
            return notifications;
        } catch (error) {
            console.error('Error creating chat notifications:', error);
            throw error;
        }
    }

    // Get recipients based on role-based routing logic
    static async getRecipients(senderRole, conversationId) {
        try {
            let recipientRoles = [];

            // Role-based routing logic
            switch (senderRole) {
                case 'admin':
                    // Admin messages go to HR + Employees
                    recipientRoles = ['hr', 'employee'];
                    break;
                case 'hr':
                    // HR messages go to Admin + Employees
                    recipientRoles = ['admin', 'employee'];
                    break;
                case 'employee':
                    // Employee messages go to Admin + HR
                    recipientRoles = ['admin', 'hr'];
                    break;
                default:
                    // Default to all roles except sender
                    recipientRoles = ['admin', 'hr', 'employee'];
            }

            // Get users with specified roles
            const recipients = await User.find({
                role: { $in: recipientRoles },
                isActive: true
            });

            return recipients;
        } catch (error) {
            console.error('Error getting recipients:', error);
            throw error;
        }
    }

    // Get user's notifications
    static async getUserNotifications(userId, limit = 50) {
        try {
            const notifications = await ChatNotification.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('senderId', 'name role email')
                .lean();

            return notifications;
        } catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    }

    // Get user's unread notification count
    static async getUserUnreadCount(userId) {
        try {
            const count = await ChatNotification.getUnreadCount(userId);
            return count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    // Get unread count by conversation for user
    static async getUnreadCountByConversation(userId, conversationId) {
        try {
            const count = await ChatNotification.getUnreadCountByConversation(userId, conversationId);
            return count;
        } catch (error) {
            console.error('Error getting conversation unread count:', error);
            throw error;
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId, userId) {
        try {
            const notification = await ChatNotification.findOne({
                _id: notificationId,
                userId
            });

            if (notification) {
                await notification.markAsRead();
                return notification;
            }

            return null;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Mark all user notifications as read
    static async markAllAsRead(userId) {
        try {
            const result = await ChatNotification.updateMany(
                { userId, isRead: false },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            return result;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Mark conversation as read for user
    static async markConversationAsRead(userId, conversationId) {
        try {
            const result = await ChatNotification.markConversationAsRead(userId, conversationId);
            return result;
        } catch (error) {
            console.error('Error marking conversation as read:', error);
            throw error;
        }
    }

    // Delete notification
    static async deleteNotification(notificationId, userId) {
        try {
            const result = await ChatNotification.deleteOne({
                _id: notificationId,
                userId
            });

            return result;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Get recent notifications for popup display
    static async getRecentNotifications(userId, limit = 10) {
        try {
            const notifications = await ChatNotification.find({
                userId,
                isRead: false
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('senderId', 'name role')
                .lean();

            return notifications;
        } catch (error) {
            console.error('Error getting recent notifications:', error);
            throw error;
        }
    }
}

export default ChatNotificationController;