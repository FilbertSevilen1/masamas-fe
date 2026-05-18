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

// Auth helpers — stores in both localStorage (for API) and cookie (for middleware)
export const saveAuth = (token: string, role: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  // Set cookie for middleware (expires in 1 day)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `token=${token}; path=/; expires=${expires}`;
  document.cookie = `role=${role}; path=/; expires=${expires}`;
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
