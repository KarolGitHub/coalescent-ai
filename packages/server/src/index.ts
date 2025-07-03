// fastify-swagger has no types, so declare the module locally
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
// @ts-ignore
declare module 'fastify-swagger';

import { fastify as Fastify } from 'fastify';
import { Server, Socket } from 'socket.io';
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import { appRouter, createContext } from './trpc.js';
import cors from '@fastify/cors';
// @ts-expect-error: fastify-swagger has no types
import fastifySwagger from 'fastify-swagger';
import { generateOpenApiDocument } from 'trpc-openapi';

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

/**
 * @openapi
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns a hello world message.
 *     tags:
 *       - Misc
 *     responses:
 *       200:
 *         description: Hello world response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hello:
 *                   type: string
 */
// Note: This route is not covered by tRPC/OpenAPI generator. Consider migrating to tRPC for full Swagger support.
server.get('/', async (request, reply) => {
  return reply.redirect('/docs');
});

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Coalescent AI API',
  version: '1.0.0',
  baseUrl: 'http://localhost:3001',
});

const start = async () => {
  try {
    // Register plugins
    await server.register(cors, {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    // Register fastify-swagger for Swagger UI
    await server.register(fastifySwagger, {
      mode: 'static',
      specification: {
        document: openApiDocument,
      },
      routePrefix: '/docs',
      exposeRoute: true,
    });

    // Serve OpenAPI JSON
    server.get('/openapi.json', async (request, reply) => {
      return openApiDocument;
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
