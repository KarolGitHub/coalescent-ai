import 'dotenv/config';
import { fastify as Fastify } from 'fastify';
import { Server, Socket } from 'socket.io';
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import { appRouter, createContext } from './trpc.js';
import cors from '@fastify/cors';
import { supabase } from './supabase.js';

const server = Fastify({
  logger: true,
});

const io = new Server(server.server, {
  cors: { origin: '*' },
});

// Handle Socket.IO connections
io.on('connection', (socket: Socket) => {
  // Join a whiteboard room
  socket.on('join', async ({ boardId }) => {
    socket.join(boardId);
    // Load all events for this board
    const { data: events } = await supabase
      .from('whiteboard_events')
      .select('event')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true });
    // Send to the joining client only
    if (events) {
      socket.emit(
        'load-events',
        events.map((e) => e.event)
      );
    }
  });

  // Leave a whiteboard room
  socket.on('leave', ({ boardId }) => {
    socket.leave(boardId);
  });

  // Relay drawing events to others in the room and persist to DB
  socket.on('draw-event', async (event) => {
    console.log('draw-event received:', event); // Log incoming event
    if (event.boardId && event.userId) {
      const { error } = await supabase.from('whiteboard_events').insert({
        board_id: event.boardId,
        user_id: event.userId,
        event,
      });
      if (error) {
        console.error('Error saving event to DB:', error);
      } else {
        console.log('Event saved to DB for board:', event.boardId);
      }
      // Broadcast to others
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
