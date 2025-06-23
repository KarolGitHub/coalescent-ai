import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'common';

export const trpc = createTRPCReact<AppRouter>();

let clientInstance: ReturnType<typeof createTRPCProxyClient<AppRouter>> | null =
  null;

export function getTrpcClient() {
  if (clientInstance) return clientInstance;

  clientInstance = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: getTrpcBaseUrl() + '/trpc',
      }),
    ],
  });

  return clientInstance;
}

export function getTrpcBaseUrl() {
  if (typeof window !== 'undefined') return '';
  // For SSR/SSG, adjust as needed
  return 'http://localhost:3001';
}

// Export a singleton instance for the provider
export const trpcClient = getTrpcClient();
