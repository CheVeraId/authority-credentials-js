import { CredentialType } from './CredentialType.js';
import { ExchangeOptions } from './ExchangeOptions.js';
import { USER_AGENT } from './utils/http.js';
import type { VeraidCredential } from './VeraidCredential.js';

const MS_IN_SECOND = 1000;

/**
 * Base class for exchanging credentials for a VeraId credential.
 */
export abstract class Exchanger {
  /**
   * Exchange the credentials for a VeraId credential.
   * @param vauthCredentialUrl The VeraId Authority endpoint to obtain the credential.
   * @returns The credential if successful.
   */
  public async exchange(
    vauthCredentialUrl: URL,
    options: Partial<ExchangeOptions> = {},
  ): Promise<VeraidCredential> {
    const { initialCredentialTimeoutSeconds = 3, vauthCredentialTimeoutSeconds = 3 } = options;
    const authHeader = await this.generateVauthAuthHeader(
      vauthCredentialUrl,
      initialCredentialTimeoutSeconds * MS_IN_SECOND,
    );

    const timeoutSignal = AbortSignal.timeout(vauthCredentialTimeoutSeconds * MS_IN_SECOND);

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
      credential,
      type: CredentialType.ORG_SIGNATURE_BUNDLE,
    };
  }

  /**
   * Generate the `Authorization` request header for the VeraId Authority credential endpoint.
   * @param vauthCredentialUrl The VeraId Authority endpoint to obtain the credential.
   * @param timeoutMs The timeout (in milliseconds) to obtain the original credential.
   * @returns The authorization header.
   */
  protected abstract generateVauthAuthHeader(
    vauthCredentialUrl: URL,
    timeoutMs: number,
  ): Promise<string>;
}
