import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      // The TransformInterceptor wraps response in { success, timestamp, data }
      const { accessToken } = response.data.data || response.data;

      localStorage.setItem('access_token', accessToken);
      set({ accessToken, isLoading: false });

      // Optionally decode JWT to get user info
      // For now, we'll fetch user profile separately if needed
    } catch (err: unknown) {
      let message = 'Login failed';
      if (err instanceof Error) {
        message = err.message || message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (typeof err === 'object' && err !== null) {
        const maybe = err as { response?: { data?: { message?: string } } };
        message = maybe.response?.data?.message ?? message;
      }

      set({
        error: message,
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { email, password });
      const user = response.data;

      set({ user, isLoading: false });

      // Auto-login after registration
      await useAuthStore.getState().login(email, password);
    } catch (err: unknown) {
      let message = 'Registration failed';
      if (err instanceof Error) {
        message = err.message || message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (typeof err === 'object' && err !== null) {
        const maybe = err as { response?: { data?: { message?: string } } };
        message = maybe.response?.data?.message ?? message;
      }

      set({
        error: message,
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, accessToken: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      set({ accessToken: token });
    }
  },
}));
