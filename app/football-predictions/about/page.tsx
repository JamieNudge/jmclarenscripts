import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksVideo } from '@/components/best-picks/BestPicksVideo';
import { GoalLabV2AppsStatus } from '@/components/goallab/v2/GoalLabV2AppsStatus';
import { GoalLabV2SubpageShell } from '@/components/goallab/v2/GoalLabV2SubpageShell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { apps } from '@/lib/apps-data';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';
import { otherStorefrontApps } from '@/lib/other-storefront-apps';

const otherApps = otherStorefrontApps(apps);

export const metadata: Metadata = {
  title: `About — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  description:
    'What GoalLab is: football forecasting on the web, App Store apps, research selections, insights, and disclaimers.',
};

export default function BestPicksAboutPage() {
  return (
    <GoalLabV2SubpageShell
      title="About GoalLab"
      description="What this site is for, what you’ll find on it, and how it relates to the apps."
    >
      <section className="space-y-4">
        <p>
          GoalLab is a football forecasting platform for desktop exploration: today&apos;s fixtures and
          forecasts, research algorithm selections, methodology, and longer-form{' '}
          <Link
            href="/blog"
            className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
          >
            insights
          </Link>
          . Mobile apps (GoalLab, StatStrike, and products in development) are listed under{' '}
          <HubFootballLink
            href="/football-predictions/about#apps-status"
            className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
          >
            Apps & status
          </HubFootballLink>
          .
        </p>
        <p>
          The site is a technical and product surface — not a tipping service, not financial advice, and not
          gambling. Forecasts shown here are{' '}
          <strong className="font-medium text-[var(--hub-text)]">informational</strong> only — not betting tips,
          promises, or guarantees of future results.
        </p>
        <p>
          Individual apps have their own branding, terms, and store listings; those apply when you use the apps
          themselves. For how modelling is described at a high level, see{' '}
          <HubFootballLink
            href="/football-predictions/methodology"
            className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
          >
            Models / Methodology
          </HubFootballLink>
          .
        </p>
      </section>

      <GoalLabV2AppsStatus />

      <section
        id="other-apps"
        className="space-y-3 border-t border-[var(--hub-border-soft)] pt-6 scroll-mt-[calc(var(--gl-nav-h)+1rem)]"
      >
        <h2 className="text-xl font-semibold text-[var(--hub-text)]">Other apps</h2>
        <p>
          These are separate products — not part of the forecasting work on this site.
        </p>
        <ul className="m-0 list-none space-y-2 p-0">
          {otherApps.map((app) => (
            <li key={app.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-medium text-[var(--hub-text)]">{app.name}</span>
              {app.appStoreUrl ? (
                <a
                  href={app.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
                >
                  App Store
                </a>
              ) : null}
              {app.appStoreUrl && app.googlePlayUrl ? (
                <span className="text-[var(--hub-text-muted)]" aria-hidden>
                  ·
                </span>
              ) : null}
              {app.googlePlayUrl ? (
                <a
                  href={app.googlePlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
                >
                  Google Play
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        <p>
          If you want a bespoke iOS, Android, or Mac app designed and built,{' '}
          <HubFootballLink
            href="/football-predictions/contact"
            className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
          >
            get in touch
          </HubFootballLink>
          .
        </p>
      </section>

      <section className="space-y-3 border-t border-[var(--hub-border-soft)] pt-6">
        <h2 className="text-xl font-semibold text-[var(--hub-text)]">Video</h2>
        <p className="text-sm text-[var(--hub-text-soft)]">
          Optional hub video when configured in Firebase — expands here without cluttering the homepage.{' '}
          <a
            href="https://www.youtube.com/@TheGoalLabArchive/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
          >
            Watch more on YouTube
          </a>
          .
        </p>
        <div className="min-h-0 max-w-xl">
          <BestPicksVideo />
        </div>
      </section>

      <p className="text-xs text-[var(--hub-text-soft)] border-t border-[var(--hub-border-soft)] pt-4">
        Questions about this website: see{' '}
        <HubFootballLink
          href="/football-predictions/contact"
          className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
        >
          Contact
        </HubFootballLink>
        . Privacy and cookies:{' '}
        <HubFootballLink
          href="/football-predictions/privacy"
          className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
        >
          Privacy policies
        </HubFootballLink>
        .
      </p>
    </GoalLabV2SubpageShell>
  );
}
