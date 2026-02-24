// Leave Service
import api from './api';

export interface LeaveRequest {
    _id?: string;
    employeeId: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    appliedDate: string;
    approvedBy?: string;
    approvedDate?: string;
    remarks?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LeaveType {
    _id?: string;
    name: string;
    code: string;
    days: number;
    description?: string;
    isPaid: boolean;
    carryForward: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LeaveResponse {
    success: boolean;
    data?: LeaveRequest | LeaveRequest[];
    message?: string;
}

export interface LeaveTypeResponse {
    success: boolean;
    data?: LeaveType | LeaveType[];
    message?: string;
}

export const leaveService = {
    // Get all leave requests
    getAll: async (params?: { employeeId?: string; status?: string }): Promise<LeaveResponse> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<LeaveResponse>(`/leaves${query ? `?${query}` : ''}`);
    },

    // Get leave request by ID
    getById: async (id: string): Promise<LeaveResponse> => {
        return await api.get<LeaveResponse>(`/leaves/${id}`);
    },

    // Create leave request
    create: async (data: LeaveRequest): Promise<LeaveResponse> => {
        return await api.post<LeaveResponse>('/leaves', data);
    },

    // Update leave request
    update: async (id: string, data: Partial<LeaveRequest>): Promise<LeaveResponse> => {
        return await api.put<LeaveResponse>(`/leaves/${id}`, data);
    },

    // Delete leave request
    delete: async (id: string): Promise<LeaveResponse> => {
        return await api.delete<LeaveResponse>(`/leaves/${id}`);
    },

    // Approve/Reject leave
    updateStatus: async (id: string, status: 'Approved' | 'Rejected', remarks?: string): Promise<LeaveResponse> => {
        return await api.put<LeaveResponse>(`/leaves/${id}/status`, { status, remarks });
    },

    // Get leave balance for employee
    getBalance: async (employeeId: string): Promise<any> => {
        return await api.get(`/leaves/balance/${employeeId}`);
    },

    // Get all leave types
    getLeaveTypes: async (): Promise<LeaveTypeResponse> => {
        return await api.get<LeaveTypeResponse>('/leave-types');
    },

    // Create leave type
    createLeaveType: async (data: LeaveType): Promise<LeaveTypeResponse> => {
        return await api.post<LeaveTypeResponse>('/leave-types', data);
    },

    // Update leave type
    updateLeaveType: async (id: string, data: Partial<LeaveType>): Promise<LeaveTypeResponse> => {
        return await api.put<LeaveTypeResponse>(`/leave-types/${id}`, data);
    },

    // Delete leave type
    deleteLeaveType: async (id: string): Promise<LeaveTypeResponse> => {
        return await api.delete<LeaveTypeResponse>(`/leave-types/${id}`);
    },
};

export default leaveService;
