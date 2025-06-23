import { fastify as Fastify } from 'fastify';
import { Server, Socket } from 'socket.io';
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import { appRouter, createContext } from './trpc.js';
import cors from '@fastify/cors';

const server = Fastify({
  logger: true,
});

const io = new Server(server.server, {
  cors: { origin: '*' },
});

// Handle Socket.IO connections
io.on('connection', (socket: Socket) => {
  // Join a whiteboard room
  socket.on('join', ({ boardId }) => {
    socket.join(boardId);
  });

  // Leave a whiteboard room
  socket.on('leave', ({ boardId }) => {
    socket.leave(boardId);
  });

  // Relay drawing events to others in the room
  socket.on('draw-event', (event) => {
    if (event.boardId) {
      socket.to(event.boardId).emit('draw-event', event);
    }
  });

  // (Optional) Handle disconnects for presence
  socket.on('disconnect', () => {
    // You can broadcast a presence update here if needed
  });
});

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    // Register plugins
    await server.register(cors, {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    await server.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: appRouter,
        createContext,
      } satisfies FastifyTRPCPluginOptions<typeof appRouter>['trpcOptions'],
    });

    await server.listen({
      port: 3001,
      host: '0.0.0.0', // Listen on all available network interfaces
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
