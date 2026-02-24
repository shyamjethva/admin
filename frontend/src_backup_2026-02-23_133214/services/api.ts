import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "/api",
    headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    console.log('🔄 API Interceptor - Token:', token ? 'Present' : 'Missing');
    console.log('🔄 API Interceptor - Config:', config);

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔄 API Interceptor - Authorization header set');
    } else {
        console.log('🔄 API Interceptor - No token found in localStorage');
    }

    return config;
});

// Handle responses and errors
api.interceptors.response.use(
    (response) => {
        // Return the full response object, not just data 
        return response;
    },
    (error) => {
        // Handle 401 errors (token expired/invalid)
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;


