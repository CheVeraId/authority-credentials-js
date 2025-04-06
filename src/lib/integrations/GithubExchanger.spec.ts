import { delay, HttpResponse, http as mockHttp } from 'msw';
import { describe, expect, it } from 'vitest';

import packageJson from '../../../package.json' with { type: 'json' };
import { makeResolver, mockHttpConnections } from '../../testUtils/mockHttpConnection.js';
import { JWT } from '../../testUtils/stubs.js';
import { GithubExchanger } from './GithubExchanger.js';

const REQUEST_URL = 'https://github.example.com/token';
const TOKEN = 'github-token-123';
const AUDIENCE = 'the-audience';
const TIMEOUT_MS = 1111;

class StubGithubExchanger extends GithubExchanger {
  public callFetchJwt(audience: string, timeoutMs: number): Promise<string> {
    return this.fetchJwt(audience, timeoutMs);
  }
}

function mockGithubTokenEndpoint(responseOrResolver: (() => Promise<HttpResponse>) | HttpResponse) {
  const expectedUrl = `${REQUEST_URL}&audience=${AUDIENCE}`;
  const resolver = makeResolver(responseOrResolver);

  return mockHttp.get(expectedUrl, resolver);
}

describe('GithubExchanger', () => {
  it('should use the specified request URL', async () => {
    const exchanger = new StubGithubExchanger(REQUEST_URL, TOKEN);
    const mockResponse = new HttpResponse(JWT);
    const handler = mockGithubTokenEndpoint(mockResponse);

    const [, [request]] = await mockHttpConnections([handler], () =>
      exchanger.callFetchJwt(AUDIENCE, TIMEOUT_MS),
    );

    expect(request.url).toContain(REQUEST_URL);
  });

  it('should use the specified token', async () => {
    const exchanger = new StubGithubExchanger(REQUEST_URL, TOKEN);
    const mockResponse = new HttpResponse(JWT);
    const handler = mockGithubTokenEndpoint(mockResponse);

    const [, [request]] = await mockHttpConnections([handler], () =>
      exchanger.callFetchJwt(AUDIENCE, TIMEOUT_MS),
    );

    expect(request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
  });

  it('should use the specified audience', async () => {
    const exchanger = new StubGithubExchanger(REQUEST_URL, TOKEN);
    const mockResponse = new HttpResponse(JWT);
    const handler = mockGithubTokenEndpoint(mockResponse);

    const [, [request]] = await mockHttpConnections([handler], () =>
      exchanger.callFetchJwt(AUDIENCE, TIMEOUT_MS),
    );

    expect(request.url).toContain(`audience=${AUDIENCE}`);
  });

  it('should use the specified timeout', async () => {
    const exchanger = new StubGithubExchanger(REQUEST_URL, TOKEN);
    const delayMs = 1000;
    const handler = mockGithubTokenEndpoint(async () => {
      await delay(TIMEOUT_MS + delayMs);

      return new HttpResponse(JWT);
    });

    await expect(
      mockHttpConnections([handler], () => exchanger.callFetchJwt(AUDIENCE, TIMEOUT_MS)),
    ).rejects.toThrow('timeout');
  });

  it('should use the User-Agent "VeraId-Authority-Credential-JS"', async () => {
    const exchanger = new StubGithubExchanger(REQUEST_URL, TOKEN);
    const mockResponse = new HttpResponse(JWT);
    const handler = mockGithubTokenEndpoint(mockResponse);

    const [, [request]] = await mockHttpConnections([handler], () =>
      exchanger.callFetchJwt(AUDIENCE, TIMEOUT_MS),
    );

    expect(request.headers.get('User-Agent')).toBe(
      `VeraId-Authority-Credential-JS/${packageJson.version}`,
    );
  });

  it('should throw an error if the response is not 200', async () => {
    const exchanger = new StubGithubExchanger(REQUEST_URL, TOKEN);
    const mockResponse = new HttpResponse('Unauthorized', {
      status: 401,
    });
    const handler = mockGithubTokenEndpoint(mockResponse);

    await expect(
      mockHttpConnections([handler], () => exchanger.callFetchJwt(AUDIENCE, TIMEOUT_MS)),
    ).rejects.toThrow('Failed to fetch JWT (HTTP 401)');
  });

  it('should return JWT upon success', async () => {
    const exchanger = new StubGithubExchanger(REQUEST_URL, TOKEN);
    const mockResponse = new HttpResponse(JWT);
    const handler = mockGithubTokenEndpoint(mockResponse);

    const [jwt] = await mockHttpConnections([handler], () =>
      exchanger.callFetchJwt(AUDIENCE, TIMEOUT_MS),
    );

    expect(jwt).toBe(JWT);
  });
});
