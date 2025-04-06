/* eslint-disable n/no-process-env */

import { createLocalJWKSet, type JWTPayload, jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';

import { GithubExchanger } from '../lib/integrations/GithubExchanger.js';

const TOKEN_REQUEST_TIMEOUT_MS = 3000;
const AUDIENCE = 'https://veraid-authority.example/credentials/123';

const GH_ISSUER = 'https://token.actions.githubusercontent.com';
const GH_JWKS_URL = `${GH_ISSUER}/.well-known/jwks`;

const GH_TOKEN_REQUEST_URL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL!;
const GH_TOKEN_REQUEST_TOKEN = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN!;
const GH_REPO = process.env.GITHUB_REPOSITORY!;

if (!GH_TOKEN_REQUEST_URL || !GH_TOKEN_REQUEST_TOKEN || !GH_REPO) {
  throw new Error(
    'This is either not running on GitHub or the permission id-token is not set to "write"',
  );
}

// We should eventually deploy VeraId Authority locally so we can test this end-to-end,
// but for now we can at least test the GitHub side of things.
class StubGithubExchanger extends GithubExchanger {
  public callFetchJwt(audience: string): Promise<string> {
    return this.fetchJwt(audience, TOKEN_REQUEST_TIMEOUT_MS);
  }
}

async function verifyGithubToken(token: string, audience: string): Promise<JWTPayload> {
  const jwksResponse = await fetch(GH_JWKS_URL);
  const jwksJson = await jwksResponse.json();
  const jwks = createLocalJWKSet(jwksJson);
  const { payload } = await jwtVerify(token, jwks, {
    audience,
    issuer: GH_ISSUER,
  });

  return payload;
}

describe('Github', () => {
  it('should exchange a GitHub token for a VeraId credential', async () => {
    const exchanger = new StubGithubExchanger(GH_TOKEN_REQUEST_URL, GH_TOKEN_REQUEST_TOKEN);

    const jwt = await exchanger.callFetchJwt(AUDIENCE);

    // eslint-disable-next-line
    console.log('jwt fields', Object.keys(jwt));

    const payload = await verifyGithubToken(jwt, AUDIENCE);
    expect(payload.repository).toBe(GH_REPO);
  });
});
