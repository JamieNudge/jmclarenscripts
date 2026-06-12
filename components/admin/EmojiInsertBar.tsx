'use client';

import type { RefObject } from 'react';

const EMOJI_GROUPS = [
  {
    label: 'Faces',
    emojis: ['😀', '🙂', '😊', '😉', '😍', '🤔', '😎', '🥳', '😂', '😭', '😅', '🙃'],
  },
  {
    label: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '💪', '👀', '🙏', '✍️', '🤝', '👌', '🤞', '👋'],
  },
  {
    label: 'Symbols',
    emojis: ['❤️', '💛', '💚', '🔥', '✨', '⭐', '💡', '⚠️', '✅', '❌', '📌', '🎯'],
  },
  {
    label: 'Activity',
    emojis: ['⚽', '🏆', '📈', '📉', '💻', '🤖', '🚀', '🧠', '📣', '📝', '⏳', '🎉'],
  },
] as const;

type InputEl = HTMLInputElement | HTMLTextAreaElement;

type Props = {
  inputRef: RefObject<InputEl | null>;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  label?: string;
  onBeforeMutate?: () => void;
};

function focusSelect(el: InputEl, start: number, end: number) {
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start, end);
  });
}

function insertAtCursor(el: InputEl, full: string, set: (next: string) => void, chunk: string) {
  const start = el.selectionStart ?? full.length;
  const end = el.selectionEnd ?? full.length;
  const next = full.slice(0, start) + chunk + full.slice(end);
  set(next);
  const pos = start + chunk.length;
  focusSelect(el, pos, pos);
}

export function EmojiInsertBar({
  inputRef,
  value,
  onChange,
  disabled = false,
  label = 'Emoji',
  onBeforeMutate,
}: Props) {
  return (
    <div className="mt-2 rounded-lg border border-white/10 bg-black/15 p-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wide text-white/35">{label}</span>
        <span className="text-[10px] text-white/30">Click to insert at cursor</span>
      </div>
      <div className="max-h-36 overflow-y-auto pr-1">
        <div className="space-y-2">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 text-[10px] uppercase tracking-wide text-white/30">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={`${group.label}-${emoji}`}
                    type="button"
                    disabled={disabled}
                    className="rounded-md border border-white/15 bg-white/[0.07] px-2 py-1 text-sm leading-none text-white/90 hover:bg-white/15 disabled:pointer-events-none disabled:opacity-40"
                    onClick={() => {
                      const el = inputRef.current;
                      if (!el) return;
                      onBeforeMutate?.();
                      insertAtCursor(el, value, onChange, emoji);
                    }}
                    aria-label={`Insert ${emoji}`}
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
