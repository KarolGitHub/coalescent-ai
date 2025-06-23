import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'common';

export const trpc = createTRPCReact<AppRouter>();

export function getTrpcBaseUrl() {
  if (typeof window !== 'undefined') return '';
  // For SSR/SSG, adjust as needed
  return 'http://localhost:3001';
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getTrpcBaseUrl() + '/trpc',
    }),
  ],
});
