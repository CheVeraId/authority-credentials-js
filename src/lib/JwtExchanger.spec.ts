import { describe, expect, it } from 'vitest';

import { JWT } from '../testUtils/stubs.js';
import { VAUTH_CREDENTIAL_URL } from '../testUtils/vauth.js';
import { JwtExchanger } from './JwtExchanger.js';

const TIMEOUT_MS = 42;

class MockJwtExchanger extends JwtExchanger {
  public audience: string | undefined;

  public timeoutMs: number | undefined;

  constructor(protected readonly outcome: Error | string) {
    super();
  }

  public getHeaderValue(vauthCredentialUrl: URL, timeoutMs: number): Promise<string> {
    return this.generateVauthAuthHeader(vauthCredentialUrl, timeoutMs);
  }

  // eslint-disable-next-line require-await
  protected override async fetchJwt(audience: string, timeoutMs: number) {
    this.audience = audience;
    this.timeoutMs = timeoutMs;

    if (this.outcome instanceof Error) {
      throw this.outcome;
    }

    return this.outcome;
  }
}

describe('JwtExchanger', () => {
  it('should use Veraid Authority URL as audience', async () => {
    const exchanger = new MockJwtExchanger(JWT);

    await exchanger.getHeaderValue(VAUTH_CREDENTIAL_URL, TIMEOUT_MS);

    expect(exchanger.audience).toBe(VAUTH_CREDENTIAL_URL.toString());
  });

  it('should use the specified timeout', async () => {
    const exchanger = new MockJwtExchanger(JWT);

    await exchanger.getHeaderValue(VAUTH_CREDENTIAL_URL, TIMEOUT_MS);

    expect(exchanger.timeoutMs).toBe(TIMEOUT_MS);
  });

  it('should produce the Authorization header value with Bearer scheme', async () => {
    const exchanger = new MockJwtExchanger(JWT);

    const headerValue = await exchanger.getHeaderValue(VAUTH_CREDENTIAL_URL, TIMEOUT_MS);

    expect(headerValue).toBe(`Bearer ${JWT}`);
  });
});
