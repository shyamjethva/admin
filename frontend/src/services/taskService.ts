import api from "./api";

type ApiResponse<T> = {
    success?: boolean;
    data?: any;
    message?: string;
    tasks?: any;
    items?: any;
};

export type TaskPayload = {
    title: string;
    description?: string;
    assignedTo: string; // employee _id
    priority?: "low" | "medium" | "high";
    status?: "pending" | "in-progress" | "completed";
    dueDate?: string | null;
    category?: string;
    timeSpent?: number;
    isRunning?: boolean;
    timerStartTime?: string | null;
};

// ✅ helper: array ko kahi se bhi nikaal lo
const unwrapArray = (raw: any) => {
    const x = raw?.data ?? raw; // axios response.data vs already data
    const list =
        Array.isArray(x) ? x :
            x?.data ??
            x?.items ??
            x?.tasks ??
            x?.data?.data ??
            x?.data?.items ??
            x?.data?.tasks ??
            [];
    return Array.isArray(list) ? list : [];
};

// ✅ helper: object ko kahi se bhi nikaal lo
const unwrapObject = (raw: any) => {
    const x = raw?.data ?? raw;
    return (
        x?.data ??
        x?.task ??
        x?.item ??
        x?.data?.data ??
        x?.data?.task ??
        x?.data?.item ??
        null
    );
};

export const taskService = {
    getAll: async () => {
        const res = await api.get<ApiResponse<any>>("/tasks");
        return unwrapArray(res); // ✅ VERY IMPORTANT
    },

    getById: async (id: string) => {
        const res = await api.get<ApiResponse<any>>(`/tasks/${id}`);
        return unwrapObject(res);
    },

    create: async (payload: TaskPayload) => {
        const res = await api.post<ApiResponse<any>>("/tasks", payload);
        return unwrapObject(res);
    },

    update: async (id: string, payload: Partial<TaskPayload>) => {
        const res = await api.put<ApiResponse<any>>(`/tasks/${id}`, payload);
        return unwrapObject(res);
    },

    remove: async (id: string) => {
        await api.delete(`/tasks/${id}`);
        return true;
    },
};
