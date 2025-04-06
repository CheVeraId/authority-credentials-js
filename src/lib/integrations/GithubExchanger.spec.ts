import { delay, HttpResponse, http as mockHttp } from 'msw';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import packageJson from '../../../package.json' with { type: 'json' };
import { makeResolver, mockHttpConnections } from '../../testUtils/mockHttpConnection.js';
import { JWT } from '../../testUtils/stubs.js';
import { resetEnvVarMocks } from '../../testUtils/vitest.js';
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
  describe('fetchJwt', () => {
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

  describe('initFromEnv', () => {
    beforeEach(resetEnvVarMocks);
    afterAll(resetEnvVarMocks);

    it('should throw an error if ACTIONS_ID_TOKEN_REQUEST_URL is unset', () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_URL', undefined);
      vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_TOKEN', TOKEN);

      expect(() => GithubExchanger.initFromEnv()).toThrow(
        'ACTIONS_ID_TOKEN_REQUEST_URL must be set',
      );
    });

    it('should throw an error if ACTIONS_ID_TOKEN_REQUEST_TOKEN is unset', () => {
      vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_URL', REQUEST_URL);
      // eslint-disable-next-line unicorn/no-useless-undefined
      vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_TOKEN', undefined);

      expect(() => GithubExchanger.initFromEnv()).toThrow(
        'ACTIONS_ID_TOKEN_REQUEST_TOKEN must be set',
      );
    });

    it('should return a new GithubExchanger if env vars are set', () => {
      vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_URL', REQUEST_URL);
      vi.stubEnv('ACTIONS_ID_TOKEN_REQUEST_TOKEN', TOKEN);

      expect(GithubExchanger.initFromEnv()).toBeInstanceOf(GithubExchanger);
    });
  });
});
