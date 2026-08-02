/** Forward-test research tags on `/selections` predictions (iOS ResearchTagsGate parity). */

export const HIGH_FIREPOWER_TAG = 'bh_high_firepower_o25';

export function hasHighFirepower(tags: string[] | null | undefined): boolean {
  return Array.isArray(tags) && tags.includes(HIGH_FIREPOWER_TAG);
}

export function parseResearchTags(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const tags = raw.filter((t): t is string => typeof t === 'string' && t.trim() !== '');
  return tags.length > 0 ? tags : null;
}
