/**
 * Test utilities for VeraId Authority.
 */
import { HttpResponse, HttpResponseResolver, http as mockHttp } from 'msw';

const isFunction = (value: unknown): value is Function => typeof value === 'function';

export const VAUTH_CREDENTIAL_URL = new URL('https://vauth.example.com/credentials/id-123');

export function mockVauthCredentialEndpoint(
  responseOrResolver: HttpResponse | HttpResponseResolver,
) {
  const resolver: HttpResponseResolver = isFunction(responseOrResolver)
    ? responseOrResolver
    : () => responseOrResolver;

  return mockHttp.get(VAUTH_CREDENTIAL_URL.toString(), resolver);
}
