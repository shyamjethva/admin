// Notification Service
import api from './api';

export interface Notification {
    _id?: string;
    userId: string;
    type: 'leave' | 'task' | 'announcement' | 'interview' | 'payroll' | 'birthday' | 'holiday' | 'attendance' | 'system';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    isRead: boolean;
    link?: string;
    metadata?: any;
    createdAt: string;
    readAt?: string;
}

export interface NotificationResponse {
    success: boolean;
    data?: Notification | Notification[];
    message?: string;
    unreadCount?: number;
}

export const notificationService = {
    // Get all notifications for user
    getAll: async (userId: string, params?: { isRead?: boolean }): Promise<NotificationResponse> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<NotificationResponse>(`/notifications/${userId}${query ? `?${query}` : ''}`);
    },

    // Get notification by ID
    getById: async (id: string): Promise<NotificationResponse> => {
        return await api.get<NotificationResponse>(`/notifications/single/${id}`);
    },

    // Create notification
    create: async (data: Notification): Promise<NotificationResponse> => {
        return await api.post<NotificationResponse>('/notifications', data);
    },

    // Mark as read
    markAsRead: async (id: string): Promise<NotificationResponse> => {
        return await api.put<NotificationResponse>(`/notifications/${id}/read`, {});
    },

    // Mark all as read
    markAllAsRead: async (userId: string): Promise<NotificationResponse> => {
        return await api.put<NotificationResponse>(`/notifications/${userId}/read-all`, {});
    },

    // Delete notification
    delete: async (id: string): Promise<NotificationResponse> => {
        return await api.delete<NotificationResponse>(`/notifications/${id}`);
    },

    // Get unread count
    getUnreadCount: async (userId: string): Promise<{ success: boolean; count: number }> => {
        return await api.get(`/notifications/${userId}/unread-count`);
    },
};

export default notificationService;
