import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksVideo } from '@/components/best-picks/BestPicksVideo';
import { GoalLabV2SubpageShell } from '@/components/goallab/v2/GoalLabV2SubpageShell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

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
          . Mobile apps (GoalLab, StatStrike, and products in development) are linked from the home page.
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
