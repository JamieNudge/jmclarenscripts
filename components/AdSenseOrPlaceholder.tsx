'use client';

import { useEffect, useRef } from 'react';

const CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-6299348707363839';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

function Placeholder({
  orientation,
  className = '',
}: {
  orientation: 'vertical' | 'horizontal';
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-white/25 bg-black/20 flex items-center justify-center text-white/40 text-xs font-medium uppercase tracking-wider ${className}`}
      aria-hidden
    >
      {orientation === 'vertical' ? (
        <span
          className="inline-block [writing-mode:vertical-rl] rotate-180 py-4"
          style={{ letterSpacing: '0.2em' }}
        >
          Ad placeholder
        </span>
      ) : (
        <span className="px-4 py-3">Ad placeholder — add NEXT_PUBLIC_ADSENSE_SLOT_* in .env</span>
      )}
    </div>
  );
}

/**
 * Renders a Google AdSense display unit when `slot` is set (numeric id from AdSense → Ads → By ad unit).
 * Until approval, units may stay empty; the wrapper keeps min-height so layout matches production.
 * Without a slot, shows the dashed placeholder.
 */
export function AdSenseOrPlaceholder({
  slot,
  orientation,
  className = '',
  minHeight,
}: {
  slot?: string | null;
  orientation: 'vertical' | 'horizontal';
  className?: string;
  /** e.g. min-h-[90px] — helps reserve space when Google returns no fill */
  minHeight?: string;
}) {
  const trimmed = typeof slot === 'string' ? slot.trim() : '';
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!trimmed || pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* script not ready or blocked */
    }
  }, [trimmed]);

  if (!trimmed) {
    return <Placeholder orientation={orientation} className={className} />;
  }

  return (
    <div
      className={`rounded-xl overflow-hidden border border-white/10 bg-black/10 ${className}`}
      style={minHeight ? { minHeight } : undefined}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={trimmed}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
