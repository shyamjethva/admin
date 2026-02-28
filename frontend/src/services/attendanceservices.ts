
import api from "./api";

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Half Day" | "On Leave";

export interface Attendance {
    _id: string;
    employeeId: string | { _id: string; name: string; email: string }; // populate support
    employeeName?: string;

    date: string;
    checkIn: string;
    checkOut?: string;

    status: AttendanceStatus;
    hours?: number;
    notes?: string;

    createdAt?: string;
    updatedAt?: string;
}

export const attendanceService = {
    getAll: async (params?: { date?: string; employeeId?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        const res = await api.get<Attendance[]>(`/attendance${query ? `?${query}` : ""}`);
        return Array.isArray(res.data) ? res.data : [];
    },

    create: async (data: Partial<Attendance>) => {
        const res = await api.post<Attendance>("/attendance", data);
        return res.data;
    },

    update: async (id: string, data: Partial<Attendance>) => {
        const res = await api.put<Attendance>(`/attendance/${id}`, data);
        return res.data;
    },

    deleteAttendance: async (id: string) => {
        const res = await api.delete(`/attendance/${id}`);
        return res.data;
    },
    // Removed markAbsentEmployees function - attendance records are only created when employees clock in/out
};

export default attendanceService;

