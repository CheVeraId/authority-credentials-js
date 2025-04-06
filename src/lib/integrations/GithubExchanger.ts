import { USER_AGENT } from '../../utils/http.js';
import { JwtExchanger } from '../JwtExchanger.js';

/**
 * Exchanger of GitHub tokens for VeraId credentials.
 */
export class GithubExchanger extends JwtExchanger {
  /**
   * Create a new GitHub exchanger.
   * @param requestUrl The URL of the GitHub token endpoint (`ACTIONS_ID_TOKEN_REQUEST_URL`).
   * @param token The GitHub token to use (`ACTIONS_ID_TOKEN_REQUEST_TOKEN`).
   */
  constructor(
    protected readonly requestUrl: string,
    protected readonly token: string,
  ) {
    super();
  }

  protected override async fetchJwt(audience: string, timeoutMs: number): Promise<string> {
    const url = `${this.requestUrl}&audience=${audience}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'User-Agent': USER_AGENT,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch JWT (HTTP ${response.status})`);
    }

    return response.text();
  }
}
