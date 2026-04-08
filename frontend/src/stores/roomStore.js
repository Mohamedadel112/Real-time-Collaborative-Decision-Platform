import { create } from 'zustand';
import api from '../api/axios';

const useRoomStore = create((set) => ({
  rooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,

  fetchRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/rooms');
      set({ rooms: data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load rooms.', isLoading: false });
    }
  },

  fetchRoom: async (roomId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/rooms/${roomId}`);
      set({ currentRoom: data, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load room.', isLoading: false });
    }
  },

  createRoom: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/rooms', payload);
      set((state) => ({ rooms: [data, ...state.rooms], isLoading: false }));
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create room.', isLoading: false });
      throw err;
    }
  },

  joinRoom: async (roomId) => {
    try {
      await api.post(`/rooms/${roomId}/join`);
    } catch (err) {
      console.error('Failed to join room', err);
      throw err;
    }
  },

  leaveRoom: async (roomId) => {
    try {
      await api.post(`/rooms/${roomId}/leave`);
    } catch (err) {
      console.error('Failed to leave room', err);
    }
  },

  clearCurrentRoom: () => set({ currentRoom: null }),
}));

export default useRoomStore;
