'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/dgc/document';

export function LayerAreaPercentInput({
  value,
  onCommit,
  className = 'w-full min-w-0 rounded border border-white/15 bg-[#111] px-2 py-1 text-sm text-white',
}: {
  value: number;
  onCommit: (fraction: number) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(formatNumber(value * 100));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(formatNumber(value * 100));
    }
  }, [value, focused]);

  const commit = () => {
    const cleaned = draft.trim().replace(/%/g, '').replace(/,/g, '.');
    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) {
      onCommit(parsed / 100);
    }
    setFocused(false);
  };

  return (
    <input
      className={className}
      value={focused ? draft : `${formatNumber(value * 100)}%`}
      inputMode="decimal"
      onFocus={() => {
        setFocused(true);
        setDraft(formatNumber(value * 100));
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
      onChange={(event) => setDraft(event.target.value)}
    />
  );
}
