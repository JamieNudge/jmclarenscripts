import { BLOG_POST_EXCERPT_MAX_CHARS } from '@/lib/blog-post';

/**
 * Strip common Markdown / GFM to approximate reading text for excerpt generation.
 * Best-effort only — authors should edit the result.
 */
export function markdownToPlainSummaryText(markdown: string): string {
  let t = markdown.replace(/\r\n?/g, '\n');
  t = t.replace(/^---[\s\S]*?---\s*/m, '');
  t = t.replace(/```[^\n`]*\n[\s\S]*?```/g, ' ');
  t = t.replace(/```[\s\S]*?```/g, ' ');
  t = t.replace(/^\[\^[^\]]+\]:\s.*$/gm, ' ');
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, ' $1 ');
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  t = t.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');
  t = t.replace(/`([^`]+)`/g, '$1');
  t = t.replace(/https?:\/\/[^\s)<>"']+/gi, ' ');
  t = t.replace(/^#{1,6}\s+/gm, '');
  t = t.replace(/^\s*>\s?/gm, '');
  t = t.replace(/^(\s*[-*_]){3,}\s*$/gm, ' ');
  t = t.replace(/^\s*[-*+]\s+/gm, '');
  t = t.replace(/^\s*\d+[.)]\s+/gm, '');
  for (let i = 0; i < 4; i++) {
    t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
    t = t.replace(/\*([^*]+)\*/g, '$1');
    t = t.replace(/__([^_]+)__/g, '$1');
    t = t.replace(/(^|\s)_([^_\n]+)_(\s|$)/g, '$1$2$3');
  }
  t = t.replace(/~~([^~]+)~~/g, '$1');
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&nbsp;/gi, ' ');
  t = t.replace(/&[a-z#0-9]+;/gi, ' ');
  t = t.replace(/\|/g, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function trimToMaxCharsAtWord(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  const budget = max - 1;
  const slice = t.slice(0, budget);
  const i = slice.lastIndexOf(' ');
  if (i > max * 0.55) return `${slice.slice(0, i).trim()}…`;
  return `${slice.trim()}…`;
}

/**
 * Build a list-view excerpt from markdown: plain text, prefer one or two sentences, hard cap
 * {@link BLOG_POST_EXCERPT_MAX_CHARS}.
 */
export function suggestBlogExcerptFromMarkdown(
  markdown: string,
  maxChars: number = BLOG_POST_EXCERPT_MAX_CHARS,
): string {
  const plain = markdownToPlainSummaryText(markdown);
  if (!plain) return '';

  const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length === 0) return trimToMaxCharsAtWord(plain, maxChars);

  let acc = '';
  for (const sent of sentences) {
    const next = acc ? `${acc} ${sent}` : sent;
    if (next.length > maxChars) {
      if (!acc) return trimToMaxCharsAtWord(sent, maxChars);
      break;
    }
    acc = next;
    if (acc.length >= 160 && sentences.length > 1) break;
  }
  if (!acc) return trimToMaxCharsAtWord(plain, maxChars);
  return acc.length > maxChars ? trimToMaxCharsAtWord(acc, maxChars) : acc.trim();
}
