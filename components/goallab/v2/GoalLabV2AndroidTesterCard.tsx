import { GoalLabV2PromoCard } from '@/components/goallab/v2/GoalLabV2PromoCard';
import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';

/**
 * Compact StatStrike store promo — used in the home hero under primary CTAs.
 */
export function GoalLabV2AndroidTesterCard({ className = '' }: { className?: string }) {
  const meta = statstrikeAndroidMeta;
  return (
    <GoalLabV2PromoCard
      className={className}
      iconSrc={meta.iconSrc}
      title="StatStrike"
      badge="Now on Google Play & App Store"
      body="StatStrike is live on Google Play and the App Store. Get daily football forecasts, BTTS picks, and the public track record on Android or iPhone."
      links={[
        {
          href: meta.playStoreInstallUrl,
          label: meta.playStoreInstallLabel,
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
