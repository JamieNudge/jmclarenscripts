'use client';

import type { RefObject } from 'react';

type Props = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

function focusSelect(ta: HTMLTextAreaElement, start: number, end: number) {
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(start, end);
  });
}

function insertWrap(
  ta: HTMLTextAreaElement,
  full: string,
  set: (s: string) => void,
  before: string,
  after: string,
  emptyPlaceholder: string,
) {
  const start = ta.selectionStart ?? 0;
  const end = ta.selectionEnd ?? 0;
  const selected = full.slice(start, end);
  const inner = selected || emptyPlaceholder;
  const next = full.slice(0, start) + before + inner + after + full.slice(end);
  set(next);
  const innerStart = start + before.length;
  const innerEnd = innerStart + inner.length;
  if (!selected) {
    focusSelect(ta, innerStart, innerEnd);
  } else {
    focusSelect(ta, innerEnd, innerEnd);
  }
}

function currentLineBounds(full: string, caret: number) {
  const lineStart = full.lastIndexOf('\n', caret - 1) + 1;
  const nextNl = full.indexOf('\n', caret);
  const lineEnd = nextNl === -1 ? full.length : nextNl;
  return { lineStart, lineEnd };
}

function setHeadingLine(ta: HTMLTextAreaElement, full: string, set: (s: string) => void, level: 2 | 3) {
  const hashes = level === 2 ? '##' : '###';
  const caret = ta.selectionStart ?? 0;
  const { lineStart, lineEnd } = currentLineBounds(full, caret);
  const line = full.slice(lineStart, lineEnd);
  const stripped = line.replace(/^#{1,6}\s+/, '');
  const newLine = `${hashes} ${stripped}`;
  const next = full.slice(0, lineStart) + newLine + full.slice(lineEnd);
  set(next);
  const pos = lineStart + newLine.length;
  focusSelect(ta, pos, pos);
}

function toggleLinePrefix(ta: HTMLTextAreaElement, full: string, set: (s: string) => void, prefix: string) {
  const caret = ta.selectionStart ?? 0;
  const { lineStart, lineEnd } = currentLineBounds(full, caret);
  const line = full.slice(lineStart, lineEnd);
  const newLine = line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line;
  const next = full.slice(0, lineStart) + newLine + full.slice(lineEnd);
  set(next);
  const pos = lineStart + newLine.length;
  focusSelect(ta, pos, pos);
}

function toggleNumberedLine(ta: HTMLTextAreaElement, full: string, set: (s: string) => void) {
  const prefix = '1. ';
  const caret = ta.selectionStart ?? 0;
  const { lineStart, lineEnd } = currentLineBounds(full, caret);
  const line = full.slice(lineStart, lineEnd);
  const numbered = /^\d+\.\s+/.test(line);
  const newLine = numbered ? line.replace(/^\d+\.\s+/, '') : prefix + line.replace(/^\d+\.\s+/, '');
  const next = full.slice(0, lineStart) + newLine + full.slice(lineEnd);
  set(next);
  const pos = lineStart + newLine.length;
  focusSelect(ta, pos, pos);
}

function insertAtCursor(ta: HTMLTextAreaElement, full: string, set: (s: string) => void, chunk: string) {
  const start = ta.selectionStart ?? 0;
  const end = ta.selectionEnd ?? 0;
  const next = full.slice(0, start) + chunk + full.slice(end);
  set(next);
  const pos = start + chunk.length;
  focusSelect(ta, pos, pos);
}

function insertLink(ta: HTMLTextAreaElement, full: string, set: (s: string) => void) {
  const raw = typeof window !== 'undefined' ? window.prompt('Link URL (https://…)', 'https://') : null;
  if (raw == null) return;
  const href = raw.trim();
  if (!href) return;
  const start = ta.selectionStart ?? 0;
  const end = ta.selectionEnd ?? 0;
  const selected = full.slice(start, end);
  const label = selected || 'link text';
  const md = `[${label}](${href})`;
  const next = full.slice(0, start) + md + full.slice(end);
  set(next);
  if (!selected) {
    const labelStart = start + 1;
    focusSelect(ta, labelStart, labelStart + label.length);
  } else {
    focusSelect(ta, start + md.length, start + md.length);
  }
}

const btnCls =
  'rounded-md border border-white/15 bg-white/[0.07] px-2 py-1 text-[11px] font-medium text-white/85 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none';

export function BlogMarkdownToolbar({ textareaRef, value, onChange, disabled }: Props) {
  const withTa = (fn: (ta: HTMLTextAreaElement) => void) => {
    if (disabled) return;
    const ta = textareaRef.current;
    if (!ta) return;
    fn(ta);
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 mb-2 p-2 rounded-lg border border-white/10 bg-black/20"
      role="toolbar"
      aria-label="Markdown formatting"
    >
      <span className="w-full text-[10px] text-white/40 uppercase tracking-wide mb-0.5">Markdown</span>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Bold"
        onClick={() => withTa((ta) => insertWrap(ta, value, onChange, '**', '**', 'bold'))}
      >
        <strong className="font-bold">B</strong>
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Italic"
        onClick={() => withTa((ta) => insertWrap(ta, value, onChange, '*', '*', 'italic'))}
      >
        <em className="italic">I</em>
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Underline"
        onClick={() => withTa((ta) => insertWrap(ta, value, onChange, '<u>', '</u>', 'underlined'))}
      >
        <span className="underline">U</span>
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Strikethrough"
        onClick={() => withTa((ta) => insertWrap(ta, value, onChange, '~~', '~~', 'struck'))}
      >
        <span className="line-through opacity-90">S</span>
      </button>
      <span className="w-px h-5 bg-white/15 self-center mx-0.5" aria-hidden />
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Heading level 2 (large)"
        onClick={() => withTa((ta) => setHeadingLine(ta, value, onChange, 2))}
      >
        H2
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Heading level 3 (medium)"
        onClick={() => withTa((ta) => setHeadingLine(ta, value, onChange, 3))}
      >
        H3
      </button>
      <span className="w-px h-5 bg-white/15 self-center mx-0.5" aria-hidden />
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Bullet list (current line)"
        onClick={() => withTa((ta) => toggleLinePrefix(ta, value, onChange, '- '))}
      >
        • List
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Numbered list (current line)"
        onClick={() => withTa((ta) => toggleNumberedLine(ta, value, onChange))}
      >
        1. List
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Blockquote (current line)"
        onClick={() => withTa((ta) => toggleLinePrefix(ta, value, onChange, '> '))}
      >
        “ Quote
      </button>
      <span className="w-px h-5 bg-white/15 self-center mx-0.5" aria-hidden />
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Inline code"
        onClick={() => withTa((ta) => insertWrap(ta, value, onChange, '`', '`', 'code'))}
      >
        Inline code
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Fenced code block"
        onClick={() => withTa((ta) => insertAtCursor(ta, value, onChange, '```\n\n```\n'))}
      >
        Code block
      </button>
      <button type="button" className={btnCls} disabled={disabled} title="Insert link" onClick={() => withTa((ta) => insertLink(ta, value, onChange))}>
        Link
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={disabled}
        title="Horizontal rule"
        onClick={() => withTa((ta) => insertAtCursor(ta, value, onChange, '\n\n---\n\n'))}
      >
        Rule
      </button>
    </div>
  );
}
