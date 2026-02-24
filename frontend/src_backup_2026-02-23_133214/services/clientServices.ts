// // // Client Service
// // import api from './api';

// // export interface Client {
// //     _id?: string;
// //     clientId: string;
// //     name: string;
// //     email: string;
// //     phone: string;
// //     company: string;
// //     industry: string;
// //     address?: string;
// //     city?: string;
// //     country?: string;
// //     website?: string;
// //     contactPerson?: string;
// //     status: 'Active' | 'Inactive' | 'Pending';
// //     priority: 'Low' | 'Medium' | 'High';
// //     projectCount?: number;
// //     totalRevenue?: number;
// //     notes?: string;
// //     addedDate: string;
// //     createdAt?: string;
// //     updatedAt?: string;
// // }

// // export interface ClientResponse {
// //     success: boolean;
// //     data?: Client | Client[];
// //     message?: string;
// // }

// // export const clientService = {
// //     // Get all clients
// //     getAll: async (params?: { status?: string }): Promise<ClientResponse> => {
// //         const query = new URLSearchParams(params as any).toString();
// //         return await api.get<ClientResponse>(`/clients${query ? `?${query}` : ''}`);
// //     },

// //     // Get client by ID
// //     getById: async (id: string): Promise<ClientResponse> => {
// //         return await api.get<ClientResponse>(`/clients/${id}`);
// //     },

// //     // Create client
// //     create: async (data: Client): Promise<ClientResponse> => {
// //         return await api.post<ClientResponse>('/clients', data);
// //     },

// //     // Update client
// //     update: async (id: string, data: Partial<Client>): Promise<ClientResponse> => {
// //         return await api.put<ClientResponse>(`/clients/${id}`, data);
// //     },

// //     // Delete client
// //     delete: async (id: string): Promise<ClientResponse> => {
// //         return await api.delete<ClientResponse>(`/clients/${id}`);
// //     },

// //     // Get client stats
// //     getStats: async (): Promise<any> => {
// //         return await api.get('/clients/stats');
// //     },
// // };

// // export default clientService;



// clientservices.ts
import api from "./api";

export type ClientPayload = {
    company: string;
    contactPerson: string;
    email: string;
    phone: string;
    industry?: string;
    projects?: number;
    address?: string;
    status?: "active" | "inactive";
};

// ✅ handles both cases:
// A) api.ts interceptor unwrap => api.get() returns array/object directly
// B) normal axios => returns { data: {...} }
function extractList(res: any): any[] {
    if (!res) return [];

    // case A: already array
    if (Array.isArray(res)) return res;

    // case B: axios response
    const data = res?.data ?? res;

    if (Array.isArray(data)) return data;

    // common backend shapes
    const list =
        data?.data ??
        data?.items ??
        data?.clients ??
        data?.data?.clients ??
        data?.data?.items;

    return Array.isArray(list) ? list : [];
}

function extractOne(res: any): any {
    if (!res) return null;
    if (res?.data !== undefined && res?.data?.data !== undefined) return res.data.data; // axios + {data:{data:x}}
    if (res?.data !== undefined) return res.data; // axios + {data:x}
    return res; // already unwrapped
}

export const clientService = {
    getAll: async () => {
        const res = await api.get("/clients");
        return extractList(res);
    },

    create: async (payload: ClientPayload) => {
        const res = await api.post("/clients", payload);
        return extractOne(res);
    },

    update: async (id: string, payload: Partial<ClientPayload>) => {
        const res = await api.put(`/clients/${id}`, payload);
        return extractOne(res);
    },

    remove: async (id: string) => {
        const res = await api.delete(`/clients/${id}`);
        return extractOne(res);
    },
};



