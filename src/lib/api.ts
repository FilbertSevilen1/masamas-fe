import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized indicates the token is expired or invalid
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        clearAuth();
        localStorage.removeItem('userName');
        
        // Prevent infinite loops if they are already on the login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth helpers — stores in both localStorage (for API) and cookie (for middleware)
export const saveAuth = (token: string, role: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  // Set cookie for middleware (expires in 1 day)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `token=${token}; path=/; expires=${expires}; max-age=86400; SameSite=Lax`;
  document.cookie = `role=${role}; path=/; expires=${expires}; max-age=86400; SameSite=Lax`;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const getStoredRole = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem('role');
  return null;
};

export default api;
