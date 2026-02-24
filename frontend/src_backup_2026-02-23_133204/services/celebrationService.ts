// Celebration Service (Holidays, Birthdays, Anniversaries)
import api from './api';

export interface Celebration {
    _id?: string;
    type: 'holiday' | 'birthday' | 'anniversary';
    title: string;
    date: string;
    description?: string;
    isRecurring?: boolean;
    employeeId?: string;
    employeeName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CelebrationResponse {
    success: boolean;
    data?: Celebration | Celebration[];
    message?: string;
}

export const celebrationService = {
    // Get all celebrations
    getAll: async (params?: { type?: string; month?: number }): Promise<CelebrationResponse> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<CelebrationResponse>(`/celebrations${query ? `?${query}` : ''}`);
    },

    // Get celebration by ID
    getById: async (id: string): Promise<CelebrationResponse> => {
        return await api.get<CelebrationResponse>(`/celebrations/${id}`);
    },

    // Create celebration
    create: async (data: Celebration): Promise<CelebrationResponse> => {
        return await api.post<CelebrationResponse>('/celebrations', data);
    },

    // Update celebration
    update: async (id: string, data: Partial<Celebration>): Promise<CelebrationResponse> => {
        return await api.put<CelebrationResponse>(`/celebrations/${id}`, data);
    },

    // Delete celebration
    delete: async (id: string): Promise<CelebrationResponse> => {
        return await api.delete<CelebrationResponse>(`/celebrations/${id}`);
    },

    // Get upcoming celebrations
    getUpcoming: async (days: number = 30): Promise<CelebrationResponse> => {
        return await api.get<CelebrationResponse>(`/celebrations/upcoming?days=${days}`);
    },
};

export default celebrationService;
