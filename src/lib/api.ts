import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

// Base API instance
export const api = axios.create({
    baseURL: '/api/v1', // Vite proxy will handle this
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors
api.interceptors.response.use(
    (response) => response.data, // Unwrap data
    (error) => {
        // Optional: Handle 401 Unauthorized globally here (logout)
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
