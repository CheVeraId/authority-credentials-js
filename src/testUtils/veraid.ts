import { HttpResponse } from 'msw';

import { CredentialType } from '../lib/CredentialType.js';

export const VERAID_CREDENTIAL = Buffer.from('VeraId credential');

export function stubOrgSignatureBundleResponse() {
  return new HttpResponse(VERAID_CREDENTIAL, {
    headers: {
      'Content-Type': CredentialType.ORG_SIGNATURE_BUNDLE,
    },
  });
}
