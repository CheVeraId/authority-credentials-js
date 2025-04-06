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

  let result: CallbackResult;
  try {
    result = await callback();
  } finally {
    server.close();
  }

  return [result, requests];
}
