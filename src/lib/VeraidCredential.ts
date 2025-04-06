import type { CredentialType } from './CredentialType.js';

/**
 * A VeraId credential.
 */
export interface VeraidCredential {
  /**
   * The serialised credential.
   */
  readonly credential: Buffer;

  /**
   * The type of VeraId credential.
   */
  readonly type: CredentialType;
}
