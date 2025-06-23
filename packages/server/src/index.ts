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

const io = new Server(server.server);

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  socket.on('ping', () => {
    socket.emit('pong');
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
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
