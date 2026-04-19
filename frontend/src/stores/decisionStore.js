import { create } from 'zustand';
import api from '../api/axios';

const useDecisionStore = create((set) => ({
  decisions: [],
  currentDecision: null,
  isLoading: false,
  error: null,
  weightResult: null,

  fetchDecisions: async (roomId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/rooms/${roomId}/decisions`);
      set({ decisions: data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load decisions.', isLoading: false });
    }
  },

  fetchDecision: async (decisionId) => {
    set({ isLoading: true, error: null });
    try {
      // The backend uses @Controller('rooms/:roomId/decisions') so we pass '0' as roomId since findOne ignores it
      const { data } = await api.get(`/rooms/0/decisions/${decisionId}`);
      set({ currentDecision: data, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load decision.', isLoading: false });
    }
  },

  createDecision: async ({ roomId, ...payload }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/rooms/${roomId}/decisions`, payload);
      set((state) => ({ decisions: [data, ...state.decisions], isLoading: false }));
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create decision.', isLoading: false });
      throw err;
    }
  },

  castVote: async (decisionId, optionId) => {
    try {
      const { data } = await api.post(`/decisions/${decisionId}/votes`, { optionId });
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Called by WebSocket events to update decision state live
  updateDecisionLive: (updated) => {
    set((state) => ({
      currentDecision: state.currentDecision?.id === updated.id ? updated : state.currentDecision,
      decisions: state.decisions.map((d) => (d.id === updated.id ? updated : d)),
    }));
  },

  clearCurrentDecision: () => set({ currentDecision: null }),

  setWeightResult: (result) => set({ weightResult: result }),
  clearWeightResult: () => set({ weightResult: null }),
}));

export default useDecisionStore;
