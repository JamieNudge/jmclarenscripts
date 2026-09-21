/** How many times the success page may retry a missing claim (Stripe webhook lag). */
export const MAX_PASS_CLAIM_ATTEMPTS = 10;

export function passClaimAttemptsKey(claimKey: string): string {
  return `statstrike-pass-claim-attempts:${claimKey}`;
}

export function passClaimReturnedKey(claimKey: string): string {
  return `statstrike-pass-claim-returned:${claimKey}`;
}

export type MissingClaimSession = {
  unlocked: boolean;
  expiresAt: string | null;
  passId: string | null;
};

export type MissingClaimDecision =
  | {
      kind: 'already_unlocked';
      status: 200;
      body: MissingClaimSession & { alreadyClaimed: true };
    }
  | {
      kind: 'gone';
      status: 410;
      body: { error: string; retry: false };
    };

/**
 * Claim token is gone (consumed or never written). Do not 409-retry: that looks
 * like Stripe lag and bounces staff unlock forever.
 */
export function decisionForMissingClaimToken(session: MissingClaimSession): MissingClaimDecision {
  if (session.unlocked) {
    return {
      kind: 'already_unlocked',
      status: 200,
      body: {
        unlocked: true,
        expiresAt: session.expiresAt,
        passId: session.passId,
        alreadyClaimed: true,
      },
    };
  }
  return {
    kind: 'gone',
    status: 410,
    body: {
      error: 'Pass claim is no longer available',
      retry: false,
    },
  };
}
