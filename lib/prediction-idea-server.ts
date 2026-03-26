/** Server-only: RTDB root for public form POSTs and admin listing. */
export function predictionIdeaSubmissionsRoot(): string {
  return (
    process.env.FIREBASE_PREDICTION_IDEA_SUBMISSIONS_ROOT?.trim() || 'predictionIdeaSubmissions'
  );
}
