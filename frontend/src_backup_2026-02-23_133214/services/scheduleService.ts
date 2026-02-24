// Shift & Weekly Plan Service
import api from './api';

export interface Shift {
    _id?: string;
    name: string;
    code: string;
    startTime: string;
    endTime: string;
    workingHours: number;
    breakTime?: number;
    isActive: boolean;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface WeeklyPlan {
    _id?: string;
    employeeId: string;
    employeeName: string;
    week: string;
    year: number;
    weekNumber: number;
    schedule: Array<{
        day: string;
        date: string;
        shiftId?: string;
        shiftName?: string;
        isWeekend?: boolean;
        isHoliday?: boolean;
        notes?: string;
    }>;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ShiftResponse {
    success: boolean;
    data?: Shift | Shift[];
    message?: string;
}

export interface WeeklyPlanResponse {
    success: boolean;
    data?: WeeklyPlan | WeeklyPlan[];
    message?: string;
}

export const shiftService = {
    // Get all shifts
    getAll: async (): Promise<ShiftResponse> => {
        return await api.get<ShiftResponse>('/shifts');
    },

    // Get shift by ID
    getById: async (id: string): Promise<ShiftResponse> => {
        return await api.get<ShiftResponse>(`/shifts/${id}`);
    },

    // Create shift
    create: async (data: Shift): Promise<ShiftResponse> => {
        return await api.post<ShiftResponse>('/shifts', data);
    },

    // Update shift
    update: async (id: string, data: Partial<Shift>): Promise<ShiftResponse> => {
        return await api.put<ShiftResponse>(`/shifts/${id}`, data);
    },

    // Delete shift
    delete: async (id: string): Promise<ShiftResponse> => {
        return await api.delete<ShiftResponse>(`/shifts/${id}`);
    },
};

export const weeklyPlanService = {
    // Get all weekly plans
    getAll: async (params?: { employeeId?: string; week?: string }): Promise<WeeklyPlanResponse> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<WeeklyPlanResponse>(`/weekly-plans${query ? `?${query}` : ''}`);
    },

    // Get weekly plan by ID
    getById: async (id: string): Promise<WeeklyPlanResponse> => {
        return await api.get<WeeklyPlanResponse>(`/weekly-plans/${id}`);
    },

    // Create weekly plan
    create: async (data: WeeklyPlan): Promise<WeeklyPlanResponse> => {
        return await api.post<WeeklyPlanResponse>('/weekly-plans', data);
    },

    // Update weekly plan
    update: async (id: string, data: Partial<WeeklyPlan>): Promise<WeeklyPlanResponse> => {
        return await api.put<WeeklyPlanResponse>(`/weekly-plans/${id}`, data);
    },

    // Delete weekly plan
    delete: async (id: string): Promise<WeeklyPlanResponse> => {
        return await api.delete<WeeklyPlanResponse>(`/weekly-plans/${id}`);
    },
};
