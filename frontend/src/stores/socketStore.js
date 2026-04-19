import { create } from 'zustand';
import { getSocket, connectSocket, disconnectSocket } from '../api/socket';

const useSocketStore = create((set, get) => ({
  isConnected: false,
  lastWeightResult: null,
  lastUpdate: null,

  connect: () => {
    const socket = connectSocket();

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    // Listen for room-level real-time updates
    socket.on('receiveUpdate', (data) => {
      set({ lastUpdate: data });
    });

    return socket;
  },

  disconnect: () => {
    disconnectSocket();
    set({ isConnected: false, lastWeightResult: null, lastUpdate: null });
  },

  joinRoom: (roomId) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('joinRoom', { roomId });
    }
  },

  leaveRoom: (roomId) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('leaveRoom', { roomId });
    }
  },

  joinDecision: (decisionId) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('joinDecision', { decisionId });
    }
  },

  leaveDecision: (decisionId) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('leaveDecision', { decisionId });
    }
  },

  /**
   * Vote via WebSocket — returns the WeightResult from the backend gateway
   * @param {{ userId: string, decisionId: string, optionId: string }} data
   * @returns {Promise<WeightResult>}
   */
  voteViaSocket: (data) => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      if (!socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('vote', data, (response) => {
        if (response?.event === 'error') {
          reject(new Error(response.data?.message || 'Vote failed'));
        } else if (response?.event === 'voteConfirmed') {
          set({ lastWeightResult: response.data });
          resolve(response.data);
        } else {
          // Fallback — some gateways return different shapes
          set({ lastWeightResult: response });
          resolve(response);
        }
      });
    });
  },

  clearWeightResult: () => set({ lastWeightResult: null }),
  clearLastUpdate: () => set({ lastUpdate: null }),
}));

export default useSocketStore;
