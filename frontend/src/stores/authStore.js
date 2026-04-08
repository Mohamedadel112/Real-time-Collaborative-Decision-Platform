import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('access_token', data.access_token);
      set({ token: data.access_token, user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('access_token', data.access_token);
      set({ token: data.access_token, user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
