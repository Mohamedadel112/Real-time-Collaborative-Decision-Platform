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

  acceptInvite: async (token, userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/admin/invite/accept', { token, ...userData });
      // If the backend returns a token, auto-login
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        set({ token: data.access_token, user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to accept invite.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
      return data;
    } catch (err) {
      // Silent fail — user may not have a valid token
      console.warn('Failed to fetch profile:', err.response?.status);
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
