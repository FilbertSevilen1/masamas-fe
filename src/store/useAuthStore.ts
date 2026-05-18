import { create } from 'zustand';
import { clearAuth, getStoredRole } from '@/lib/api';

interface AuthState {
  token: string | null;
  role: string | null;
  name: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  init: () => void;
  logout: () => void;
  setAuth: (token: string, role: string, name: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  name: null,
  isLoggedIn: false,
  isAdmin: false,

  init: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName');
    if (token && role) {
      set({
        token,
        role,
        name,
        isLoggedIn: true,
        isAdmin: role === 'ADMIN',
      });
    }
  },

  setAuth: (token, role, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userName', name);
    set({ token, role, name, isLoggedIn: true, isAdmin: role === 'ADMIN' });
  },

  logout: () => {
    clearAuth();
    localStorage.removeItem('userName');
    set({ token: null, role: null, name: null, isLoggedIn: false, isAdmin: false });
  },
}));
