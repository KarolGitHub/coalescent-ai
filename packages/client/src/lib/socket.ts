import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    socket = io(url, { transports: ['websocket'] });
  }
  return socket;
}
