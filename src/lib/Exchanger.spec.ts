import { delay, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import packageJson from '../../package.json' with { type: 'json' };
import { mockHttpConnections } from '../testUtils/mockHttpConnection.js';
import { mockVauthCredentialEndpoint, VAUTH_CREDENTIAL_URL } from '../testUtils/vauth.js';
import { stubOrgSignatureBundleResponse, VERAID_CREDENTIAL } from '../testUtils/veraid.js';
import { CredentialType } from './CredentialType.js';
import { Exchanger } from './Exchanger.js';

const TIMEOUT_SECONDS = 3;
const MS_IN_SECOND = 1000;
const TIMEOUT_MS = TIMEOUT_SECONDS * MS_IN_SECOND;

const MOCK_AUTH_HEADER = 'Mock-Scheme mock-token';

const MOCK_VAUTH_CREDENTIAL_ENDPOINT = mockVauthCredentialEndpoint(stubOrgSignatureBundleResponse);

class MockExchanger extends Exchanger {
  public timeoutSeconds: number | undefined;

  public vaultCredentialUrl: undefined | URL;

  constructor(protected readonly outcome: Error | string) {
    super();
  }

  // eslint-disable-next-line require-await
  protected async generateVauthAuthHeader(vauthCredentialUrl: URL, timeoutSeconds: number) {
    this.vaultCredentialUrl = vauthCredentialUrl;
    this.timeoutSeconds = timeoutSeconds;

    if (this.outcome instanceof Error) {
      throw this.outcome;
    }

    return this.outcome;
  }
}

describe('Exchanger', () => {
  describe('Authorization header generation', () => {
    it('should use specified VeraId Authority credential URL', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);

      await mockHttpConnections([MOCK_VAUTH_CREDENTIAL_ENDPOINT], () =>
        exchanger.exchange(VAUTH_CREDENTIAL_URL),
      );

      expect(exchanger.vaultCredentialUrl).toBe(VAUTH_CREDENTIAL_URL);
    });

    it('should time out after 3 seconds by default', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);

      await mockHttpConnections([MOCK_VAUTH_CREDENTIAL_ENDPOINT], () =>
        exchanger.exchange(VAUTH_CREDENTIAL_URL),
      );

      expect(exchanger.timeoutSeconds).toBe(TIMEOUT_SECONDS);
    });

    it('should time out after specified seconds', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);
      const timeoutSeconds = 10;

      await mockHttpConnections([MOCK_VAUTH_CREDENTIAL_ENDPOINT], () =>
        exchanger.exchange(VAUTH_CREDENTIAL_URL, {
          initialCredentialTimeoutSeconds: timeoutSeconds,
        }),
      );

      expect(exchanger.timeoutSeconds).toBe(timeoutSeconds);
    });
  });

  describe('VeraId credential request', () => {
    it('should use the User-Agent "VeraId-Authority-Credential-JS"', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);

      const [, [request]] = await mockHttpConnections([MOCK_VAUTH_CREDENTIAL_ENDPOINT], () =>
        exchanger.exchange(VAUTH_CREDENTIAL_URL),
      );

      expect(request.headers.get('User-Agent')).toBe(
        `VeraId-Authority-Credential-JS/${packageJson.version}`,
      );
    });

    it('should use the Authorization header', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);

      const [, [request]] = await mockHttpConnections([MOCK_VAUTH_CREDENTIAL_ENDPOINT], () =>
        exchanger.exchange(VAUTH_CREDENTIAL_URL),
      );

      expect(request.headers.get('Authorization')).toBe(MOCK_AUTH_HEADER);
    });

    it('should time out after 3 seconds by default', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);
      const handler = mockVauthCredentialEndpoint(async () => {
        await delay(TIMEOUT_MS + MS_IN_SECOND);

        return new HttpResponse(VERAID_CREDENTIAL);
      });

      await expect(
        mockHttpConnections([handler], () => exchanger.exchange(VAUTH_CREDENTIAL_URL)),
      ).rejects.toThrow('timeout');
    });

    it('should time out after specified seconds', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);
      const timeoutSeconds = 1;
      const timeoutMs = timeoutSeconds * MS_IN_SECOND;
      const handler = mockVauthCredentialEndpoint(async () => {
        await delay(timeoutMs + MS_IN_SECOND);

        return new HttpResponse(VERAID_CREDENTIAL);
      });

      await expect(
        mockHttpConnections([handler], () =>
          exchanger.exchange(VAUTH_CREDENTIAL_URL, {
            vauthCredentialTimeoutSeconds: timeoutSeconds,
          }),
        ),
      ).rejects.toThrow('timeout');
    });

    it('should require response content type to be organisation signature bundle', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);
      const invalidContentType = 'text/html';
      const handler = mockVauthCredentialEndpoint(
        new HttpResponse(VERAID_CREDENTIAL, {
          headers: { 'Content-Type': invalidContentType },
        }),
      );

      await expect(
        mockHttpConnections([handler], () => exchanger.exchange(VAUTH_CREDENTIAL_URL)),
      ).rejects.toThrow(
        `VeraId credential response has invalid content type (${invalidContentType})`,
      );
    });

    it('should error out if response is 4XX', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);
      const status = 400;
      const handler = mockVauthCredentialEndpoint(new HttpResponse(VERAID_CREDENTIAL, { status }));

      await expect(
        mockHttpConnections([handler], () => exchanger.exchange(VAUTH_CREDENTIAL_URL)),
      ).rejects.toThrow(`Failed to fetch VeraId credential (HTTP ${status})`);
    });

    it('should error out if response is 5XX', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);
      const status = 500;
      const handler = mockVauthCredentialEndpoint(new HttpResponse(VERAID_CREDENTIAL, { status }));

      await expect(
        mockHttpConnections([handler], () => exchanger.exchange(VAUTH_CREDENTIAL_URL)),
      ).rejects.toThrow(`Failed to fetch VeraId credential (HTTP ${status})`);
    });

    it('should output valid organisation signature bundles', async () => {
      const exchanger = new MockExchanger(MOCK_AUTH_HEADER);

      const [credential] = await mockHttpConnections([MOCK_VAUTH_CREDENTIAL_ENDPOINT], () =>
        exchanger.exchange(VAUTH_CREDENTIAL_URL),
      );

      expect(credential.type).toBe(CredentialType.ORG_SIGNATURE_BUNDLE);
      expect(credential.credential).toEqual(VERAID_CREDENTIAL);
    });
  });
});
