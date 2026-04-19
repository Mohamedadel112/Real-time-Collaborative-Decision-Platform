import { create } from 'zustand';
import api from '../api/axios';

const useInviteStore = create((set, get) => ({
  invites: [],
  isLoading: false,
  error: null,
  sendingInvite: false,
  sendSuccess: false,

  // Computed: remaining quota (max 5 pending)
  get remainingQuota() {
    return 5 - get().invites.filter((i) => i.status === 'PENDING').length;
  },

  fetchInvites: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/admin/invite/history');
      set({ invites: data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load invites.',
        isLoading: false,
      });
    }
  },

  sendInvite: async (email) => {
    set({ sendingInvite: true, error: null, sendSuccess: false });
    try {
      const { data } = await api.post('/admin/invite', { email });
      set((state) => ({
        invites: [data, ...state.invites],
        sendingInvite: false,
        sendSuccess: true,
      }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send invite.';
      set({ error: msg, sendingInvite: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearSendSuccess: () => set({ sendSuccess: false }),
}));

export default useInviteStore;
