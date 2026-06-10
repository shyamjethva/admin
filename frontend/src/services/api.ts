// src/services/api.ts
import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_BACKEND_URL;
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const baseURL =
    configuredBaseUrl && (isLocalHost || !configuredBaseUrl.includes("localhost"))
        ? configuredBaseUrl
        : "/api";

// Create axios instance with default config
const api = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
