/**
 * Test utilities for VeraId Authority.
 */
import {
  type HttpHandler,
  type HttpResponse,
  type HttpResponseResolver,
  http as mockHttp,
} from 'msw';

import { makeResolver } from './mockHttpConnection.js';

export const VAUTH_CREDENTIAL_URL = new URL('https://vauth.example.com/credentials/id-123');

export function mockVauthCredentialEndpoint(
  responseOrResolver: HttpResponse | HttpResponseResolver,
): HttpHandler {
  const resolver = makeResolver(responseOrResolver);

  return mockHttp.get(VAUTH_CREDENTIAL_URL.toString(), resolver);
}
