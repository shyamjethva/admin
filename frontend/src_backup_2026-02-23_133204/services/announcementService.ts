// Announcement Service
import api from './api';

export interface Announcement {
    _id?: string;
    title: string;
    content: string;
    type: 'General' | 'Important' | 'Urgent' | 'Event' | 'Policy' | 'Holiday';
    priority: 'Low' | 'Medium' | 'High';
    postedBy: string;
    postedDate: string;
    expiryDate?: string;
    targetAudience: 'All' | 'Admin' | 'HR' | 'Employee' | 'Department';
    department?: string;
    attachments?: string[];
    isActive: boolean;
    readBy?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AnnouncementResponse {
    success: boolean;
    data?: Announcement | Announcement[];
    message?: string;
}

export const announcementService = {
    // Get all announcements
    getAll: async (params?: { type?: string; isActive?: boolean }): Promise<AnnouncementResponse> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<AnnouncementResponse>(`/announcements${query ? `?${query}` : ''}`);
    },

    // Get announcement by ID
    getById: async (id: string): Promise<AnnouncementResponse> => {
        return await api.get<AnnouncementResponse>(`/announcements/${id}`);
    },

    // Create announcement
    create: async (data: Announcement): Promise<AnnouncementResponse> => {
        return await api.post<AnnouncementResponse>('/announcements', data);
    },

    // Update announcement
    update: async (id: string, data: Partial<Announcement>): Promise<AnnouncementResponse> => {
        return await api.put<AnnouncementResponse>(`/announcements/${id}`, data);
    },

    // Delete announcement
    delete: async (id: string): Promise<AnnouncementResponse> => {
        return await api.delete<AnnouncementResponse>(`/announcements/${id}`);
    },

    // Mark as read
    markAsRead: async (id: string, userId: string): Promise<AnnouncementResponse> => {
        return await api.post<AnnouncementResponse>(`/announcements/${id}/read`, { userId });
    },
};

export default announcementService;
