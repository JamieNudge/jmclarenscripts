/**
 * In-article ad **placeholders** for long blog posts (AdSense Auto ads can use these regions when enabled).
 *
 * **Rule of thumb (editorial / policy-friendly spacing):** spacing in-content units about every
 * **300–500 words** is common so the page does not feel cluttered; the first slot is usually
 * **after the opening** (often 300+ words) rather than before the first paragraph. We use a first
 * slot after **~400** words, then **~450** words between slots, **max 3** in-article, inserted
 * only on paragraph boundaries (double newlines) so we do not break Markdown mid-block in normal posts.
 */
export const BLOG_AD_MIN_WORDS_BEFORE_FIRST = 400;
export const BLOG_AD_WORDS_BETWEEN_SLOTS = 450;
export const BLOG_AD_MAX_IN_ARTICLE = 3;

export type BlogBodySegment = { type: 'markdown'; markdown: string } | { type: 'ad' };

function countWordsInChunk(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

/**
 * Splits the post body into markdown chunks and `ad` slots. Short posts get a single markdown
 * segment and no in-article ads.
 */
export function splitBlogMarkdownForAdPlaceholders(
  bodyMarkdown: string,
  options?: { minWordsFirst?: number; betweenWords?: number; maxAds?: number },
): BlogBodySegment[] {
  const minFirst = options?.minWordsFirst ?? BLOG_AD_MIN_WORDS_BEFORE_FIRST;
  const between = options?.betweenWords ?? BLOG_AD_WORDS_BETWEEN_SLOTS;
  const maxAds = options?.maxAds ?? BLOG_AD_MAX_IN_ARTICLE;

  const paragraphs = bodyMarkdown.split(/\n{2,}/);
  const out: BlogBodySegment[] = [];
  const buffer: string[] = [];
  let totalWords = 0;
  let sinceAd = 0;
  let ads = 0;

  function flushMarkdown() {
    if (buffer.length === 0) return;
    out.push({ type: 'markdown', markdown: buffer.join('\n\n') });
    buffer.length = 0;
  }

  for (const raw of paragraphs) {
    const w = countWordsInChunk(raw);
    totalWords += w;
    sinceAd += w;
    buffer.push(raw);

    if (ads < maxAds) {
      const firstSlot = ads === 0 && totalWords >= minFirst;
      const furtherSlot = ads > 0 && sinceAd >= between;
      if (firstSlot || furtherSlot) {
        flushMarkdown();
        out.push({ type: 'ad' });
        ads += 1;
        sinceAd = 0;
      }
    }
  }

  flushMarkdown();
  return out.length > 0 ? out : [{ type: 'markdown', markdown: bodyMarkdown }];
}
