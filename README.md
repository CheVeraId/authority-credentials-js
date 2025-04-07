# `@veraid/authority-credentials`

JS library to automate the exchange of cloud credentials for [VeraId](https://veraid.net) credentials via [VeraId Authority](https://docs.relaycorp.tech/veraid-authority/).

## Installation

This library is available on NPM as [`@veraid/authority-credentials`](https://www.npmjs.com/package/@veraid/authority-credentials).

## Usage

To use any of the [built-in integrations](#built-in-integrations) and have them auto-configure themselves (e.g. from environment variables), use [`initExchangerFromEnv`](https://docs.veraid.net/authority-credentials-js/modules/initFromEnv.html#initfromenvname-exchangername) as follows:

```ts
import { initExchangerFromEnv } from '@veraid/authority-credentials';

// Replace with the actual URL for exchanging credentials
const EXCHANGE_ENDPOINT = new URL('https://veraid-authority.example/credentials/123');

// Replace with the exchanger you want to use
const EXCHANGER_NAME = 'GITHUB';

const exchanger = initExchangerFromEnv(EXCHANGER_NAME);
const { credential } = await exchanger.exchange(EXCHANGE_ENDPOINT);
```

Alternatively, you can use the specific integration class directly.

## Built-in Integrations

### GitHub (`GITHUB`)

[`GithubExchanger`](https://docs.veraid.net/authority-credentials-js/classes/GithubExchanger.html) can be used to exchange GitHub tokens for VeraId credentials as follows:

```ts
import { GithubExchanger } from '@veraid/authority-credentials';

// Replace with the actual URL for exchanging credentials
const EXCHANGE_ENDPOINT = new URL('https://veraid-authority.example/credentials/123');

const exchanger = GithubExchanger.initFromEnv();
const { credential } = await exchanger.exchange(EXCHANGE_ENDPOINT);
```

When configured from environment variables, `ACTIONS_ID_TOKEN_REQUEST_URL` and `ACTIONS_ID_TOKEN_REQUEST_TOKEN` must be set. They're automatically set when [the GitHub job has been granted the `id-token: write` permission](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect#adding-permissions-settings). [Learn more on the GitHub documentation](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect).

### Amazon Web Services

AWS doesn't appear to offer a passwordless way for a workflow to obtain JWTs from Amazon Cognito, so AWS will be supported via [OAuth2 Client Credentials](#oauth2-client-credentials).

### Google Cloud Platform

[Google Cloud Platform support is on the roadmap](https://relaycorp.atlassian.net/browse/VAUTH-15).

### Kubernetes

[Kubernetes support is on the roadmap](https://relaycorp.atlassian.net/browse/VAUTH-17).

### Microsoft Azure

[Azure support is on the roadmap](https://relaycorp.atlassian.net/browse/VAUTH-14).

### OAuth2 Client Credentials

[OAuth2 Client Credentials support is on the roadmap](https://relaycorp.atlassian.net/browse/VAUTH-16).

## Custom Integrations

You can create a custom integration by extending the [`JwtExchanger` class](https://docs.veraid.net/authority-credentials-js/classes/JwtExchanger.html).

## API docs

The API documentation can be found on [docs.veraid.net](https://docs.veraid.net/authority-credentials-js/).

## Contributions

We love contributions! If you haven't contributed to a Relaycorp project before, please take a minute to [read our guidelines](https://github.com/relaycorp/.github/blob/master/CONTRIBUTING.md) first.

Issues are tracked on the [VAUTH project on Jira](https://relaycorp.atlassian.net/browse/VAUTH) (`Credentials Exchanger (JS)` component).
