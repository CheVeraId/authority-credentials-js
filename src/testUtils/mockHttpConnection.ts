import type { HttpHandler } from 'msw';
import { setupServer } from 'msw/node';

export async function mockHttpConnections<CallbackResult>(
  handlers: HttpHandler[],
  callback: () => Promise<CallbackResult>,
): Promise<[CallbackResult, Request[]]> {
  const server = setupServer(...handlers);

  const requests: Request[] = [];
  server.events.on('request:start', ({ request }) => requests.push(request));

  server.listen({ onUnhandledRequest: 'error' });

  try {
    // eslint-disable-next-line n/callback-return
    const result = await callback();

    return [result, requests];
  } finally {
    server.close();
  }
}
