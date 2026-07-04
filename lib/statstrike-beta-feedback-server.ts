/** Server-only: RTDB root for StatStrike Android beta feedback form POSTs. */
export function statstrikeBetaFeedbackSubmissionsRoot(): string {
  return (
    process.env.FIREBASE_STATSTRIKE_BETA_FEEDBACK_ROOT?.trim() || 'statstrikeBetaFeedbackSubmissions'
  );
}
