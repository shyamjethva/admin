// // attendance.ts
// import api from "./api";

// export interface Attendance {
//     _id?: string;
//     employeeId: string;
//     employeeName: string;
//     date: string;
//     clockIn: string;
//     clockOut?: string;
//     status: "Present" | "Absent" | "Late" | "Half Day" | "On Leave";
//     workHours?: number;
//     notes?: string;
//     location?: { latitude: number; longitude: number };
//     createdAt?: string;
//     updatedAt?: string;
// }

// export type AttendanceResponse = {
//     success: boolean;
//     data?: Attendance | Attendance[];
//     message?: string;
// };

// export const attendanceService = {
//     getAll: async (params?: { date?: string; employeeId?: string }) => {
//         const query = new URLSearchParams(params as any).toString();
//         const res = await api.get<AttendanceResponse>(`/attendance${query ? `?${query}` : ""}`);
//         return res.data; // ✅ IMPORTANT
//     },

//     getById: async (id: string) => {
//         const res = await api.get<AttendanceResponse>(`/attendance/${id}`);
//         return res.data;
//     },

//     clockIn: async (data: { employeeId: string; location?: any }) => {
//         const res = await api.post<AttendanceResponse>("/attendance/clock-in", data);
//         return res.data;
//     },

//     clockOut: async (data: { employeeId: string; attendanceId: string }) => {
//         const res = await api.post<AttendanceResponse>("/attendance/clock-out", data);
//         return res.data;
//     },

//     create: async (data: Attendance) => {
//         const res = await api.post<AttendanceResponse>("/attendance", data);
//         return res.data;
//     },

//     update: async (id: string, data: Partial<Attendance>) => {
//         const res = await api.put<AttendanceResponse>(`/attendance/${id}`, data);
//         return res.data;
//     },

//     delete: async (id: string) => {
//         const res = await api.delete<AttendanceResponse>(`/attendance/${id}`);
//         return res.data;
//     },

//     getReport: async (params: { startDate: string; endDate: string; employeeId?: string }) => {
//         const query = new URLSearchParams(params as any).toString();
//         const res = await api.get(`/attendance/report?${query}`);
//         return res.data;
//     },

//     getTodayAttendance: async (employeeId: string) => {
//         const res = await api.get<AttendanceResponse>(`/attendance/today/${employeeId}`);
//         return res.data;
//     },
// };

// export default attendanceService;




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

    delete: async (id: string) => {
        const res = await api.delete(`/attendance/${id}`);
        return res.data;
    },

    markAbsentEmployees: async (date?: string) => {
        const res = await api.post('/attendance/mark-absent', { date });
        return res.data;
    },
};

export default attendanceService;

