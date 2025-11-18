// src/utils/api.js
import axios from 'axios';

// En desarrollo, usar el proxy de Vite (ruta relativa)
// En producción, usar ruta relativa /api (servido por Django)
const getBaseURL = () => {
    if (import.meta.env.DEV) {
        // En desarrollo, usar proxy de Vite o URL explícita si está configurada
        return import.meta.env.VITE_API_URL || '/api';
    } else {
        // En producción, usar rutas relativas (servidas por Django)
        return '/api';
    }
};

const baseURL = getBaseURL();

const api = axios.create({ 
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // JWT no requiere cookies
});

// Interceptor para agregar token JWT a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    // Usar la misma lógica de baseURL para refresh
                    // El proxy de Vite maneja /auth y /api/auth automáticamente
                    const refreshURL = getBaseURL().replace('/api', '') + '/auth/refresh/';
                    
                    const response = await axios.post(refreshURL, {
                        refresh: refreshToken,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // No redirigir a /login en API, dejar que el componente maneje el error
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;

