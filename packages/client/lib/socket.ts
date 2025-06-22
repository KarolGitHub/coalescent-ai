import { io, Socket } from 'socket.io-client';

const URL = typeof window !== 'undefined' ? 'http://localhost:3001' : '';

export const socket: Socket = io(URL);
