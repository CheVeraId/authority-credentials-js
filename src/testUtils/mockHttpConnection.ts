import type { HttpHandler, HttpResponse, HttpResponseResolver } from 'msw';
import { setupServer } from 'msw/node';

function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function makeResolver(
  responseOrResolver: HttpResponse | HttpResponseResolver,
): HttpResponseResolver {
  return isFunction(responseOrResolver) ? responseOrResolver : () => responseOrResolver;
}

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
