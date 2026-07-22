/**
 * Kill switch for StatStrike Web (hero embed + /statstrike app routes).
 * Unset or anything other than "1" keeps GoalLab hero fixture card and disables the product shell.
 */
export function isStatStrikeWebEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED === '1';
}
