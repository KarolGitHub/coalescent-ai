import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/src/trpc';

export const trpc = createTRPCReact<AppRouter>();

export function getTrpcBaseUrl() {
  if (typeof window !== 'undefined') return '';
  // For SSR/SSG, adjust as needed
  return 'http://localhost:3001';
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getTrpcBaseUrl() + '/trpc',
    }),
  ],
});
