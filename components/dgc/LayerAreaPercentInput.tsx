'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/dgc/document';

function parsePercentInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/%/g, '').replace(/,/g, '.');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

export function LayerAreaPercentInput({
  value,
  onCommit,
  className = 'w-full min-w-0 rounded border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-2 py-1 text-sm text-[var(--dgc-text)]',
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

  const commit = (raw: string) => {
    const parsed = parsePercentInput(raw);
    if (parsed !== null) {
      onCommit(parsed / 100);
      return true;
    }
    return false;
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
      onBlur={() => {
        commit(draft);
        setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        commit(next);
      }}
    />
  );
}
