'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

/** GitHub-style defaults + `<u>` for admin toolbar underlines; raw HTML is parsed then sanitized. */
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'u'],
  attributes: {
    ...defaultSchema.attributes,
    u: [],
    img: [...(defaultSchema.attributes?.img ?? []), ['src'], ['alt'], ['title'], ['loading']],
    a: [...(defaultSchema.attributes?.a ?? []), ['href', 'httpTarget'], ['title', 'title']],
  },
};

const markdownBox =
  'blog-markdown-body [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-3 [&_p]:leading-relaxed [&_a]:text-[var(--hub-accent-link)] [&_a]:underline [&_u]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:my-1 [&_code]:text-sm [&_code]:bg-black/35 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-[var(--hub-inset)] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4 text-[var(--hub-text-soft)]';

type Props = {
  markdown: string;
  className?: string;
};

export function MarkdownBody({ markdown, className = '' }: Props) {
  return (
    <div className={`${markdownBox} ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
