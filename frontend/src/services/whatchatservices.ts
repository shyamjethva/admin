// src/services/whatchatService.ts
import api from "./api";

export type UploadFile = {
    name: string;
    size: number;
    type: string;
    dataUrl: string; // base64
} | null;

export type ChatMessage = {
    _id?: string;
    userId: string;
    userName: string;
    userRole: string;
    message: string;
    timestamp?: string;
    file?: UploadFile;
    department?: string;
    isPrivate?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export const whatchatService = {
    // ✅ GET /api/chat
    getAll: async (limit: number = 100): Promise<ChatMessage[]> => {
        const res = await api.get<ApiResponse<ChatMessage[]>>("/chat", {
            params: { limit },
        });
        return Array.isArray(res.data?.data) ? res.data.data : [];
    },

    // ✅ POST /api/chat
    create: async (payload: Omit<ChatMessage, "_id">): Promise<ChatMessage> => {
        console.log('Sending chat message:', payload); // Debug log

        const body = {
            userId: payload.userId,
            userName: payload.userName,
            userRole: payload.userRole, // ✅ REQUIRED by backend
            message: payload.message || "",
            timestamp: payload.timestamp || new Date().toISOString(),
            file: payload.file || null,
            department: payload.department || "",
            isPrivate: !!payload.isPrivate,
        };

        console.log('Sending request body:', body); // Debug log
        const res = await api.post<ApiResponse<ChatMessage>>("/chat", body);
        console.log('Received response:', res.data); // Debug log
        return res.data.data;
    },
};
