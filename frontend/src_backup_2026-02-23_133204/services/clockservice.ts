import api from "./api";

export interface ClockRecord {
    _id?: string;
    employeeId: string;
    employeeName?: string;
    date: string;
    checkIn: string;
    checkInTimestamp?: string;
    checkOut?: string;
    hours?: number;
    status?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ClockResponse {
    success: boolean;
    data?: ClockRecord | ClockRecord[];
    message?: string;
}

export const clockService = {
    // Clock in
    clockIn: async (data: { employeeId: string; employeeName?: string }) => {
        console.log('🔄 Clock service - sending clock in request:', data);
        const res = await api.post<ClockResponse>("/clock/clock-in", data);
        console.log('🔄 Clock service - received response:', res);
        return res.data;
    },

    // Clock out
    clockOut: async (data: { employeeId: string }) => {
        const res = await api.post<ClockResponse>("/clock/clock-out", data);
        return res.data;
    },

    // Get today's attendance record
    getToday: async (employeeId: string) => {
        const res = await api.get<ClockResponse>(`/clock/today/${employeeId}`);
        return res.data;
    },

    // Get weekly attendance records
    getWeekly: async (employeeId: string) => {
        const res = await api.get<ClockResponse>(`/clock/weekly/${employeeId}`);
        return res.data;
    },

    // Get all attendance records with filters
    getAll: async (params?: {
        employeeId?: string;
        startDate?: string;
        endDate?: string
    }) => {
        const query = new URLSearchParams(params as any).toString();
        const res = await api.get<ClockResponse>(`/clock${query ? `?${query}` : ""}`);
        return res.data;
    }
};

export default clockService;