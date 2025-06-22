import { initTRPC } from '@trpc/server';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { z } from 'zod';

// Initialize tRPC
const t = initTRPC.create();

// Example router
export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello, ${input?.name ?? 'world'}!`,
      };
    }),
});

export type AppRouter = typeof appRouter;

// Fastify plugin for tRPC
export const trpcPlugin = fastifyTRPCPlugin<AppRouter>({
  router: appRouter,
  createContext: () => ({}),
});
