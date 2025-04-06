export interface ExchangeOptions {
  /**
   * The timeout (in seconds) to obtain the initial credential.
   */
  readonly initialCredentialTimeoutSeconds: number;

  /**
   * The timeout (in seconds) to obtain the VeraId credential.
   */
  readonly vauthCredentialTimeoutSeconds: number;
}
