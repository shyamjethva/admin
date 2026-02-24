// Employee Service
import api from './api';

export interface Employee {
    _id?: string;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    joiningDate: string;
    status: 'Active' | 'Inactive';
    role: 'Admin' | 'HR' | 'Employee';
    salary?: number;
    avatar?: string;
    address?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeResponse {
    success: boolean;
    data?: Employee | Employee[];
    message?: string;
}

export const employeeService = {
    // Get all employees
    getAll: async (): Promise<EmployeeResponse> => {
        return await api.get<EmployeeResponse>('/employees');
    },

    // Get employee by ID
    getById: async (id: string): Promise<EmployeeResponse> => {
        return await api.get<EmployeeResponse>(`/employees/${id}`);
    },

    // Create employee
    create: async (data: Employee): Promise<EmployeeResponse> => {
        return await api.post('/employees', {
            ...formData,
            departmentId: formData.departmentId,
            designationId: formData.designationId,
        });

    },

    // Update employee
    update: async (id: string, data: Partial<Employee>): Promise<EmployeeResponse> => {
        return await api.put<EmployeeResponse>(`/employees/${id}`, data);
    },

    // Delete employee
    delete: async (id: string): Promise<EmployeeResponse> => {
        return await api.delete<EmployeeResponse>(`/employees/${id}`);
    },

    // Get employee stats
    getStats: async (): Promise<any> => {
        return await api.get('/employees/stats');
    },
};

export default employeeService;

