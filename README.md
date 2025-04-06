# `@veraid/authority-credentials`

JS library to automate the exchange of cloud credentials for VeraId Authority credentials.

## Installation

This library is available on NPM as [`@veraid/authority-credentials`](https://www.npmjs.com/package/@veraid/authority-credentials).

## Integrations

### GitHub

[`GithubExchanger`](https://docs.veraid.net/authority-credentials-js/classes/GithubExchanger.html) can be used to exchange GitHub tokens for VeraId credentials as follows:

```ts
import { GithubExchanger } from '@veraid/authority-credentials';

// Replace with the actual URL for exchanging credentials
const EXCHANGE_ENDPOINT = new URL('https://veraid-authority.example/credentials/123');

const exchanger = new GithubExchanger(
  process.env.ACTIONS_ID_TOKEN_REQUEST_URL,
  process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
);

const { credential } = await exchanger.exchange(EXCHANGE_ENDPOINT);
```

Note that for the above to work, [the GitHub workflow must have been granted the `id-token: write` permission](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings). [Learn more on the GitHub documentation](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect).

## API docs

The API documentation can be found on [docs.veraid.net](https://docs.veraid.net/authority-credentials-js/).

## Contributions

We love contributions! If you haven't contributed to a Relaycorp project before, please take a minute to [read our guidelines](https://github.com/relaycorp/.github/blob/master/CONTRIBUTING.md) first.

Issues are tracked on the [VAUTH project on Jira](https://relaycorp.atlassian.net/browse/VAUTH) (`Credentials Exchanger (JS)` component).
