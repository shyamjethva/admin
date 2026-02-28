import mongoose from "mongoose";

const ChatNotificationSchema = new mongoose.Schema(
    {
        // Notification recipient
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Sender information
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        senderName: {
            type: String,
            required: true
        },
        senderRole: {
            type: String,
            enum: ["admin", "hr", "employee"],
            required: true
        },

        // Message content
        message: {
            type: String,
            required: true,
            trim: true
        },
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatMessage",
            required: true
        },

        // Conversation/Thread information
        conversationId: {
            type: String,
            required: true,
            index: true
        },

        // Notification metadata
        type: {
            type: String,
            enum: ["message", "file", "mention"],
            default: "message"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        // Read status
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        readAt: {
            type: Date
        },

        // Timestamps
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient querying
ChatNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
ChatNotificationSchema.index({ conversationId: 1, userId: 1 });
ChatNotificationSchema.index({ senderId: 1, userId: 1 });

// Virtual for relative time
ChatNotificationSchema.virtual('relativeTime').get(function () {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.createdAt.toLocaleDateString();
});

// Method to mark as read
ChatNotificationSchema.methods.markAsRead = function () {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Static method to get unread count for user
ChatNotificationSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({ userId, isRead: false });
};

// Static method to get unread count by conversation for user
ChatNotificationSchema.statics.getUnreadCountByConversation = function (userId, conversationId) {
    return this.countDocuments({ userId, conversationId, isRead: false });
};

// Static method to mark conversation as read for user
ChatNotificationSchema.statics.markConversationAsRead = function (userId, conversationId) {
    return this.updateMany(
        { userId, conversationId, isRead: false },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
                updatedAt: new Date()
            }
        }
    );
};

export default mongoose.model("ChatNotification", ChatNotificationSchema);