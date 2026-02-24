// Authentication Service
import api from "./api";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: {
        id?: string;
        _id?: string;
        name: string;
        email: string;
        role: "admin" | "hr" | "employee";
        employeeId?: string;
        department?: string;
        designation?: string;
        avatar?: string;
    };
    message?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: "admin" | "hr" | "employee";
    employeeId?: string;
    department?: string;
    designation?: string;
    phone?: string;
    joiningDate?: string;
}

const authService = {
    // ✅ Login
    login: async (credentials: LoginCredentials) => {
        return await api.post<LoginResponse>(
            "/auth/login",
            credentials
        );
    },

    // ✅ Register
    register: async (data: RegisterData): Promise<any> => {
        return await api.post("/auth/register", data);
    },

    // ✅ Logout
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        window.location.href = "/";
    },

    // ✅ Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem("currentUser");
        return userStr ? JSON.parse(userStr) : null;
    },

    // ✅ Check auth
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem("token");
    },

    // ✅ Get role
    getUserRole: (): string | null => {
        const userStr = localStorage.getItem("currentUser");
        if (!userStr) return null;
        return JSON.parse(userStr)?.role || null;
    },
};

export default authService;
