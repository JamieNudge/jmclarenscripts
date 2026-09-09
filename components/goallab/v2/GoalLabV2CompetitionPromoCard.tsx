import { GoalLabV2PromoCard } from '@/components/goallab/v2/GoalLabV2PromoCard';
import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';
import { statstrikeCompetitionPromo } from '@/lib/statstrike-competition-promo';

/**
 * Homepage announcement for You vs StatStrike. Copy switches when `live` is true.
 */
export function GoalLabV2CompetitionPromoCard({ className = '' }: { className?: string }) {
  const promo = statstrikeCompetitionPromo;
  const copy = promo.live ? promo.liveCopy : promo.comingSoon;

  return (
    <GoalLabV2PromoCard
      className={className}
      iconSrc={promo.iconSrc}
      title={promo.title}
      badge={copy.badge}
      body={copy.body}
      links={[
        { href: promo.rulesHref, label: promo.rulesLabel },
        ...(promo.live
          ? [
              {
                href: statstrikeAndroidMeta.appStoreUrl,
                label: statstrikeAndroidMeta.appStoreInstallLabel,
                external: true,
              },
            ]
          : []),
      ]}
    />
  );
}
