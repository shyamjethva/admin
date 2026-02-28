import api from './api';

export const chatNotificationService = {
    // Get user's notifications
    getNotifications: async (limit = 50) => {
        const response = await api.get(`/chat-notifications?limit=${limit}`);
        return response.data;
    },

    // Get unread notification count
    getUnreadCount: async () => {
        const response = await api.get('/chat-notifications/unread-count');
        return response.data;
    },

    // Get unread count by conversation
    getUnreadCountByConversation: async (conversationId) => {
        const response = await api.get(`/chat-notifications/unread-count/${conversationId}`);
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        const response = await api.put(`/chat-notifications/${notificationId}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.put('/chat-notifications/read-all');
        return response.data;
    },

    // Mark conversation as read
    markConversationAsRead: async (conversationId) => {
        const response = await api.put(`/chat-notifications/conversation/${conversationId}/read`);
        return response.data;
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/chat-notifications/${notificationId}`);
        return response.data;
    },

    // Get recent notifications for popup display
    getRecentNotifications: async (limit = 10) => {
        const response = await api.get(`/chat-notifications/recent?limit=${limit}`);
        return response.data;
    }
};

export default chatNotificationService;