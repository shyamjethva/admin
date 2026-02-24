// Department & Designation Service
import api from './api';

export interface Department {
    _id?: string;
    name: string;
    code: string;
    head?: string;
    description?: string;
    employeeCount?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Designation {
    _id?: string;
    title: string;
    code: string;
    department: string;
    level: string;
    description?: string;
    employeeCount?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface DepartmentResponse {
    success: boolean;
    data?: Department | Department[];
    message?: string;
}

export interface DesignationResponse {
    success: boolean;
    data?: Designation | Designation[];
    message?: string;
}

export const departmentService = {
    // Get all departments
    getAll: async (): Promise<DepartmentResponse> => {
        return await api.get<DepartmentResponse>('/departments');
    },

    // Get department by ID
    getById: async (id: string): Promise<DepartmentResponse> => {
        return await api.get<DepartmentResponse>(`/departments/${id}`);
    },

    // Create department
    create: async (data: Department): Promise<DepartmentResponse> => {
        return await api.post<DepartmentResponse>('/departments', data);
    },

    // Update department
    update: async (id: string, data: Partial<Department>): Promise<DepartmentResponse> => {
        return await api.put<DepartmentResponse>(`/departments/${id}`, data);
    },

    // Delete department
    delete: async (id: string): Promise<DepartmentResponse> => {
        return await api.delete<DepartmentResponse>(`/departments/${id}`);
    },
};

export const designationService = {
    // Get all designations
    getAll: async (params?: { department?: string }): Promise<DesignationResponse> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<DesignationResponse>(`/designations${query ? `?${query}` : ''}`);
    },

    // Get designation by ID
    getById: async (id: string): Promise<DesignationResponse> => {
        return await api.get<DesignationResponse>(`/designations/${id}`);
    },

    // Create designation
    create: async (data: Designation): Promise<DesignationResponse> => {
        return await api.post<DesignationResponse>('/designations', data);
    },

    // Update designation
    update: async (id: string, data: Partial<Designation>): Promise<DesignationResponse> => {
        return await api.put<DesignationResponse>(`/designations/${id}`, data);
    },

    // Delete designation
    delete: async (id: string): Promise<DesignationResponse> => {
        return await api.delete<DesignationResponse>(`/designations/${id}`);
    },
};
