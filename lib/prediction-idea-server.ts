/** Server-only: RTDB root for public form POSTs and admin listing. */
export function predictionIdeaSubmissionsRoot(): string {
  return (
    process.env.FIREBASE_PREDICTION_IDEA_SUBMISSIONS_ROOT?.trim() || 'predictionIdeaSubmissions'
  );
}

/** Server-only: normalized submitter emails blocked from the prediction-idea form (Admin SDK only). */
export function predictionIdeaBlockedEmailsRoot(): string {
  return (
    process.env.FIREBASE_PREDICTION_IDEA_BLOCKLIST_ROOT?.trim() || 'predictionIdeaBlockedEmails'
  );
}

export function normalizePredictionIdeaEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Stable RTDB child key without . # $ / [ ] */
export function predictionIdeaEmailBlocklistKey(normalizedEmail: string): string {
  return Buffer.from(normalizedEmail, 'utf8').toString('base64url');
}
