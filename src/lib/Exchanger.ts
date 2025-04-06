import { ExchangeOptions } from './ExchangeOptions.js';
import type { Credential } from './Credential.js';
import packageJson from '../../package.json' with { type: 'json' };
import { CredentialType } from './CredentialType.js';

const USER_AGENT = `VeraId-Authority-Credential-JS/${packageJson.version}`;

/**
 * Base class for exchanging credentials for a VeraId credential.
 */
export abstract class Exchanger {
  /**
   * Generate the `Authorization` request header for the VeraId Authority credential endpoint.
   * @param vauthCredentialUrl The VeraId Authority endpoint to obtain the credential.
   * @param timeoutSeconds The timeout (in seconds) to obtain the original credential.
   * @returns The authorization header.
   */
  protected abstract generateVauthAuthHeader(
    vauthCredentialUrl: URL,
    timeoutSeconds: number,
  ): Promise<string>;

  /**
   * Exchange the credentials for a VeraId credential.
   * @param vauthCredentialUrl The VeraId Authority endpoint to obtain the credential.
   * @returns The credential if successful.
   */
  public async exchange(
    vauthCredentialUrl: URL,
    {
      initialCredentialTimeoutSeconds = 3,
      vauthCredentialTimeoutSeconds = 3,
    }: Partial<ExchangeOptions> = {},
  ): Promise<Credential> {
    const authHeader = await this.generateVauthAuthHeader(
      vauthCredentialUrl,
      initialCredentialTimeoutSeconds,
    );

    const timeoutSignal = AbortSignal.timeout(vauthCredentialTimeoutSeconds * 1000);
    const response = await fetch(vauthCredentialUrl, {
      headers: {
        'Authorization': authHeader,
        'User-Agent': USER_AGENT,
      },
      signal: timeoutSignal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch VeraId credential (HTTP ${response.status})`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType !== CredentialType.ORG_SIGNATURE_BUNDLE) {
      throw new Error(`VeraId credential response has invalid content type (${contentType})`);
    }

    const credential = Buffer.from(await response.arrayBuffer());
    return {
      type: CredentialType.ORG_SIGNATURE_BUNDLE,
      credential,
    } as Credential;
  }
}
