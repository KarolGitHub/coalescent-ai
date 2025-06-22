import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { Server, Socket } from 'socket.io';

const fastify = Fastify({
  logger: true,
});

const io = new Server(fastify.server);

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  return { hello: 'world' };
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
