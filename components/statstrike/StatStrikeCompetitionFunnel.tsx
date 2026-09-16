import Image from 'next/image';
import Link from 'next/link';
import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';
import { statstrikeCompetitionPromo } from '@/lib/statstrike-competition-promo';

/**
 * Funnel to the iOS You vs StatStrike contest. No web prize, no Disagree on this board.
 */
export function StatStrikeCompetitionFunnel() {
  const promo = statstrikeCompetitionPromo;
  const copy = promo.live ? promo.liveCopy : promo.comingSoon;

  return (
    <aside className="mb-4 rounded-xl border border-black/10 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <Image
          src={promo.iconSrc}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight text-[#0b3d5c]">{promo.title}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-black/55">
            {copy.badge}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-black/70">{copy.body}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
            <Link
              href={promo.rulesHref}
              className="text-[#0b3d5c] underline-offset-2 hover:underline"
            >
              {promo.rulesLabel}
            </Link>
            <a
              href={statstrikeAndroidMeta.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0b3d5c] underline-offset-2 hover:underline"
            >
              {statstrikeAndroidMeta.appStoreInstallLabel}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
