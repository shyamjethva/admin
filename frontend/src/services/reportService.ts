// Report Service
import api from './api';

export interface ReportParams {
    type: 'attendance' | 'leave' | 'payroll' | 'task' | 'employee' | 'recruitment';
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    department?: string;
    format?: 'json' | 'pdf' | 'excel';
}

export interface ReportData {
    success: boolean;
    data: any;
    summary?: any;
    message?: string;
}

export const reportService = {
    // Get attendance report
    getAttendanceReport: async (params: {
        startDate: string;
        endDate: string;
        employeeId?: string;
        department?: string;
    }): Promise<ReportData> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<ReportData>(`/reports/attendance?${query}`);
    },

    // Get leave report
    getLeaveReport: async (params: {
        startDate: string;
        endDate: string;
        employeeId?: string;
        department?: string;
    }): Promise<ReportData> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<ReportData>(`/reports/leave?${query}`);
    },

    // Get payroll report
    getPayrollReport: async (params: {
        month: string;
        year: number;
        employeeId?: string;
        department?: string;
    }): Promise<ReportData> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<ReportData>(`/reports/payroll?${query}`);
    },

    // Get task report
    getTaskReport: async (params: {
        startDate: string;
        endDate: string;
        assignedTo?: string;
        status?: string;
    }): Promise<ReportData> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<ReportData>(`/reports/task?${query}`);
    },

    // Get employee report
    getEmployeeReport: async (params: {
        department?: string;
        designation?: string;
        status?: string;
    }): Promise<ReportData> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<ReportData>(`/reports/employee?${query}`);
    },

    // Get recruitment report
    getRecruitmentReport: async (params: {
        startDate: string;
        endDate: string;
        position?: string;
    }): Promise<ReportData> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<ReportData>(`/reports/recruitment?${query}`);
    },

    // Export report
    exportReport: async (params: ReportParams): Promise<Blob> => {
        const query = new URLSearchParams(params as any).toString();
        const response = await fetch(`http://localhost:5000/api/reports/export?${query}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return await response.blob();
    },

    // Get dashboard stats
    getDashboardStats: async (): Promise<any> => {
        return await api.get('/reports/dashboard-stats');
    },
};

export default reportService;
