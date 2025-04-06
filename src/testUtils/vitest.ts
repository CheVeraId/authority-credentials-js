import { vi } from 'vitest';

export function resetEnvVarMocks() {
  vi.unstubAllEnvs();
}
