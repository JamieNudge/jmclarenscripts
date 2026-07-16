'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StatStrikeAppStoreCta } from '@/components/statstrike/StatStrikeAppStoreCta';
import { apps } from '@/lib/apps-data';

const appStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

type Props = {
  open: boolean;
  title?: string;
  body?: string;
  onClose: () => void;
};

/** Premium stub until Stripe — points to the iOS App Store. */
export function StatStrikePremiumGate({
  open,
  title = 'Premium on iOS',
  body = 'Your Picks, personal track record, and league-change digests are available in the StatStrike iOS app. Web subscriptions come later.',
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="ss-premium-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/images/stat-strike-icon.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <h2 id="ss-premium-title" className="text-base font-bold text-[#0b3d5c]">
            {title}
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-black/65">{body}</p>
        <div className="mt-4 flex flex-col gap-2">
          {appStoreUrl ? <StatStrikeAppStoreCta href={appStoreUrl} size="md" /> : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-semibold text-black/70 hover:bg-black/[0.03]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
