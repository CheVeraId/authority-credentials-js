import { describe, expect, it, vi } from 'vitest';

import { type ExchangerName, initExchangerFromEnv } from './initFromEnv.js';
import { GithubExchanger } from './integrations/GithubExchanger.js';

describe('initExchangerFromEnv', () => {
  it('should throw an error if the exchanger is not found', () => {
    const invalidName = 'INVALID' as ExchangerName;

    expect(() => initExchangerFromEnv(invalidName)).toThrow(
      `Unrecognised exchanger (${invalidName})`,
    );
  });

  it('should return the GitHub exchanger if requested', () => {
    const githubInitMock = vi.spyOn(GithubExchanger, 'initFromEnv');
    const stubExchanger = Symbol('stubExchanger');
    githubInitMock.mockReturnValueOnce(stubExchanger as unknown as GithubExchanger);

    const exchanger = initExchangerFromEnv('GITHUB');

    expect(exchanger).toBe(stubExchanger);
  });

  it('should do a case-insensitive match on the exchanger name', () => {
    const githubInitMock = vi.spyOn(GithubExchanger, 'initFromEnv');
    const stubExchanger = Symbol('stubExchanger');
    githubInitMock.mockReturnValueOnce(stubExchanger as unknown as GithubExchanger);

    const exchanger = initExchangerFromEnv('github' as ExchangerName);

    expect(exchanger).toBe(stubExchanger);
  });
});
