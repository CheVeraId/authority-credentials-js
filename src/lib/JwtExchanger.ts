import { Exchanger } from './Exchanger.js';

/**
 * Base class for exchanging a JWT for a VeraId credential.
 */
export abstract class JwtExchanger extends Exchanger {
  /**
   * Fetch the JWT from the hosting service.
   * @param audience The audience of the JWT.
   * @param timeoutMs The timeout for  in milliseconds.
   * @returns The JWT.
   */
  protected abstract fetchJwt(audience: string, timeoutMs: number): Promise<string>;

  protected override async generateVauthAuthHeader(
    vauthCredentialUrl: URL,
    timeoutMs: number,
  ): Promise<string> {
    const jwt = await this.fetchJwt(vauthCredentialUrl.toString(), timeoutMs);

    return `Bearer ${jwt}`;
  }
}
