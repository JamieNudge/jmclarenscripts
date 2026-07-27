'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StatStrikeAppStoreCta } from '@/components/statstrike/StatStrikeAppStoreCta';
import { useStatStrikeWebBlur } from '@/hooks/useStatStrikeWebBlur';
import { apps } from '@/lib/apps-data';
import { passCreatePath } from '@/lib/statstrike/pass-constants';

const appStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

type Props = {
  open: boolean;
  title?: string;
  body?: string;
  onClose: () => void;
};

/** Points visitors at the 24h Create Pass page (App Store still available as secondary). */
export function StatStrikePremiumGate({
  open,
  title = 'Get access',
  body = 'Unlock the full StatStrike web board plus Your Picks and My Record on this browser for 24 hours or 7 days.',
  onClose,
}: Props) {
  const { supporterPassSalesEnabled } = useStatStrikeWebBlur();
  if (!open) return null;

  const salesTitle = supporterPassSalesEnabled ? title : 'StatStrike on web';
  const salesBody = supporterPassSalesEnabled
    ? body
    : 'Supporter Pass purchases are temporarily unavailable. You can still get StatStrike on the App Store, or check back here soon.';

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
            {salesTitle}
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-black/80">{salesBody}</p>
        <div className="mt-4 flex flex-col gap-2">
          {supporterPassSalesEnabled ? (
            <Link
              href={passCreatePath()}
              className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-200"
              onClick={onClose}
            >
              Get access
            </Link>
          ) : null}
          {appStoreUrl ? (
            <StatStrikeAppStoreCta
              href={appStoreUrl}
              label={
                supporterPassSalesEnabled
                  ? 'Or get StatStrike on the App Store'
                  : 'Get StatStrike on the App Store'
              }
              size="md"
            />
          ) : null}
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
