import type { Exchanger } from './Exchanger.js';
import { GithubExchanger } from './integrations/GithubExchanger.js';

export type ExchangerName = 'GITHUB';

export function initExchangerFromEnv(name: ExchangerName): Exchanger {
  const nameNormalised = name.toUpperCase();

  if (nameNormalised === 'GITHUB') {
    return GithubExchanger.initFromEnv();
  }

  throw new Error(`Unrecognised exchanger (${name})`);
}
