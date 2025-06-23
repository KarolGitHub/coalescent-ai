import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { Server, Socket } from 'socket.io';
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import { appRouter, createContext } from './trpc';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true,
});

// Register CORS
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});

const io = new Server(fastify.server);

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  socket.on('ping', () => {
    socket.emit('pong');
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  return { hello: 'world' };
});

fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
  } satisfies FastifyTRPCPluginOptions<typeof appRouter>['trpcOptions'],
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
