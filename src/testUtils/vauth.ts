/**
 * Test utilities for VeraId Authority.
 */

import { HttpResponseResolver, http as mockHttp, type HttpResponse } from 'msw';

export const VAUTH_CREDENTIAL_URL = new URL('https://vauth.example.com/credentials/id-123');

export function mockVauthCredentialEndpoint(
  responseOrResolver: HttpResponse | HttpResponseResolver,
) {
  const resolver: HttpResponseResolver =
    typeof responseOrResolver === 'function' ? responseOrResolver : () => responseOrResolver;
  return mockHttp.get(VAUTH_CREDENTIAL_URL.toString(), resolver);
}
