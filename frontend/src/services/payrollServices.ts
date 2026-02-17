// Payroll Service
import api from './api';

export interface Payroll {
    _id?: string;
    employeeId: string;
    employeeName: string;
    month: string;
    year: number;
    basicSalary: number;
    allowances: {
        hra: number;
        transport: number;
        medical: number;
        other: number;
    };
    deductions: {
        tax: number;
        providentFund: number;
        insurance: number;
        other: number;
    };
    grossSalary: number;
    netSalary: number;
    status: 'Pending' | 'Processed' | 'Paid';
    paymentDate?: string;
    paymentMethod?: string;
    workingDays: number;
    presentDays: number;
    leaves: number;
    overtime?: number;
    bonus?: number;
    remarks?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SalaryStructure {
    _id?: string;
    designation: string;
    basicSalary: number;
    allowances: {
        hra: number;
        transport: number;
        medical: number;
        other: number;
    };
    deductions: {
        tax: number;
        providentFund: number;
        insurance: number;
        other: number;
    };
    totalCTC: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface PayrollResponse {
    success: boolean;
    data?: Payroll | Payroll[];
    message?: string;
}

export interface SalaryStructureResponse {
    success: boolean;
    data?: SalaryStructure | SalaryStructure[];
    message?: string;
}

export const payrollService = {
    // Get all payroll records
    getAll: async (params?: { month?: string; year?: number; employeeId?: string }): Promise<PayrollResponse> => {
        const query = new URLSearchParams(params as any).toString();
        return await api.get<PayrollResponse>(`/payroll${query ? `?${query}` : ''}`);
    },

    // Get payroll by ID
    getById: async (id: string): Promise<PayrollResponse> => {
        return await api.get<PayrollResponse>(`/payroll/${id}`);
    },

    // Create/Process payroll
    create: async (data: Payroll): Promise<PayrollResponse> => {
        return await api.post<PayrollResponse>('/payroll', data);
    },

    // Update payroll
    update: async (id: string, data: Partial<Payroll>): Promise<PayrollResponse> => {
        return await api.put<PayrollResponse>(`/payroll/${id}`, data);
    },

    // Delete payroll
    delete: async (id: string): Promise<PayrollResponse> => {
        return await api.delete<PayrollResponse>(`/payroll/${id}`);
    },

    // Process bulk payroll
    processBulk: async (data: { month: string; year: number; employeeIds: string[] }): Promise<any> => {
        return await api.post('/payroll/bulk-process', data);
    },

    // Get salary structures
    getSalaryStructures: async (): Promise<SalaryStructureResponse> => {
        return await api.get<SalaryStructureResponse>('/payroll/salary-structures');
    },

    // Create salary structure
    createSalaryStructure: async (data: SalaryStructure): Promise<SalaryStructureResponse> => {
        return await api.post<SalaryStructureResponse>('/payroll/salary-structures', data);
    },

    // Update salary structure
    updateSalaryStructure: async (id: string, data: Partial<SalaryStructure>): Promise<SalaryStructureResponse> => {
        return await api.put<SalaryStructureResponse>(`/payroll/salary-structures/${id}`, data);
    },

    // Delete salary structure
    deleteSalaryStructure: async (id: string): Promise<SalaryStructureResponse> => {
        return await api.delete<SalaryStructureResponse>(`/payroll/salary-structures/${id}`);
    },
};

export default payrollService;
