import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';
import { getApiUrl } from '../lib/api';
import { useAuthStore } from './useAuthStore';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  
  connect: () => {
    const { socket } = get();
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) return;

    const newSocket = io(getApiUrl(''), {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      set({ isConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  }
}));
