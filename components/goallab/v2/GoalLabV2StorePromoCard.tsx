import { GoalLabV2PromoCard } from '@/components/goallab/v2/GoalLabV2PromoCard';
import { goallabAndroidMeta } from '@/lib/goallab-android-beta-meta';

/**
 * Compact GoalLab store promo — App Store live, Android closed test.
 */
export function GoalLabV2StorePromoCard({ className = '' }: { className?: string }) {
  const meta = goallabAndroidMeta;
  return (
    <GoalLabV2PromoCard
      className={className}
      iconSrc={meta.iconSrc}
      title="GoalLab"
      badge={meta.badge}
      body={meta.body}
      links={[
        {
          href: meta.closedTestUrl,
          label: meta.closedTestLabel,
          external: true,
        },
        {
          href: meta.appStoreUrl,
          label: meta.appStoreInstallLabel,
          external: true,
        },
      ]}
    />
  );
}
