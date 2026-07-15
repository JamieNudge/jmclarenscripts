'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { AndAnotherThingHubPreview } from '@/components/best-picks/AndAnotherThingHubPreview';
import { BestPicksBlogPreviewsRail } from '@/components/best-picks/BestPicksBlogPreviewsRail';
import { BestPicksNewProductPanel } from '@/components/best-picks/BestPicksExtraPanels';
import { BestPicksHowAppsWorkPanel } from '@/components/best-picks/BestPicksHowAppsWorkPanel';
import { StatStrikeBetaFeedbackForm } from '@/components/best-picks/StatStrikeBetaFeedbackForm';
import { BestPicksVideo } from '@/components/best-picks/BestPicksVideo';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import { bestPicksPopgoalsComingSoonMeta } from '@/lib/best-picks-popgoals-coming-soon-meta';
import {
  statstrikeAndroidBetaHref,
  statstrikeAndroidBetaMeta,
  type StatStrikeAndroidBetaHrefKey,
} from '@/lib/statstrike-android-beta-meta';
import type { AnotherThingPost } from '@/lib/and-another-thing';
import { isFirebaseClientConfigured } from '@/lib/firebase-client';

/** Floated icon — title beside icon; body copy wraps full width underneath (matches How apps work). */
const comingSoonIconFloatClass =
  'shrink-0 float-left mt-0.5 mr-3 mb-1.5 rounded-2xl overflow-hidden border border-amber-200/30 bg-[var(--hub-elevated)] w-14 h-14 md:w-16 md:h-16';

const comingSoonScrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth overscroll-y-contain touch-pan-y';

/** Right column: StatStrike Android beta + PopGoals teaser + ProphIt in one tile (md: spans both rows). */
function BestPicksComingSoonAndProphitPanel() {
  const ss = statstrikeAndroidBetaMeta;
  const m = bestPicksPopgoalsComingSoonMeta;
  return (
    <div className={`${bestPicksGridTileClassName} min-h-0 h-full gap-0`}>
      <h2 className="text-lg md:text-xl font-semibold text-[var(--hub-text)] tracking-tight shrink-0 mb-3">
        Coming Soon!
      </h2>
      <div className={comingSoonScrollArea}>
      <section className="space-y-3 pb-4 border-b border-[var(--hub-border-soft)]">
        <div className="min-w-0 [&:after]:content-[''] [&:after]:block [&:after]:clear-both">
          <div className={comingSoonIconFloatClass} aria-hidden>
            <Image
              src={ss.iconSrc}
              alt=""
              width={144}
              height={144}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h3 className="text-base md:text-lg font-semibold text-[var(--hub-text)] tracking-tight min-w-0">
                {ss.displayName}
              </h3>
              {ss.showComingSoonBadge ? (
                <span className="shrink-0 rounded-full border border-[var(--hub-warn-border)] bg-[var(--hub-warn-bg)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[var(--hub-accent-link)]">
                  Coming Soon!
                </span>
              ) : null}
              <span className="shrink-0 rounded-full border border-[var(--hub-success-border)] bg-[var(--hub-success-bg)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[var(--hub-success)]">
                Android closed test
              </span>
            </div>
            <p className="text-sm text-[var(--hub-text-soft)] leading-relaxed">
              StatStrike for Android is in closed testing. Follow these steps in order — joining the group alone
              does not install the app.
            </p>
            <ol className="space-y-2.5 text-sm text-[var(--hub-text-soft)] leading-relaxed list-none pl-0">
              {ss.installSteps.map((step, index) => (
                <li key={step.title} className="flex gap-2.5">
                  <span
                    className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--hub-success-border)] bg-[var(--hub-success-bg)] text-[11px] font-bold text-[var(--hub-success)]"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-semibold text-[var(--hub-text)]">{step.title}</p>
                    <p className="text-[var(--hub-text-soft)]">{step.body}</p>
                    {'hrefKey' in step && step.hrefKey ? (
                      <p>
                        <a
                          href={statstrikeAndroidBetaHref(step.hrefKey as StatStrikeAndroidBetaHrefKey)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
                        >
                          {step.linkLabel}
                        </a>
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <p className="rounded-lg border border-[var(--hub-warn-border)] bg-[var(--hub-warn-bg)] px-3 py-2 text-xs text-[var(--hub-on-tint)] leading-relaxed">
              {ss.accountNote}
            </p>
          </div>
        </div>
        <details className="group rounded-xl border border-[var(--hub-border-soft)] bg-[var(--hub-panel)] overflow-hidden">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-[var(--hub-text)] hover:bg-[var(--hub-hover)] [&::-webkit-details-marker]:hidden">
            <span>Questions or feedback?</span>
            <svg
              className="w-4 h-4 text-[var(--hub-text-soft)] shrink-0 transition-transform duration-200 group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-3 pb-3 pt-2 border-t border-[var(--hub-border-soft)]">
            <StatStrikeBetaFeedbackForm collapsibleTrigger />
          </div>
        </details>
      </section>
      <section className="space-y-3 pb-4 border-b border-[var(--hub-border-soft)]">
        <div className="min-w-0 [&:after]:content-[''] [&:after]:block [&:after]:clear-both">
          <div className={comingSoonIconFloatClass} aria-hidden>
            <Image
              src={m.iconSrc}
              alt=""
              width={144}
              height={144}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h3 className="text-base md:text-lg font-semibold text-[var(--hub-text)] tracking-tight min-w-0">
                {m.displayName}
              </h3>
              <span className="shrink-0 rounded-full border border-[var(--hub-warn-border)] bg-[var(--hub-warn-bg)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[var(--hub-accent-link)]">
                Coming soon
              </span>
            </div>
            <p className="text-sm text-[var(--hub-text-soft)] leading-relaxed">
              iOS app in development. App Store listing and preview copy will follow.
            </p>
          </div>
        </div>
      </section>

      <section className="pt-5 pb-1 -mx-1 px-1">
        <BestPicksNewProductPanel embedded scrollInParent />
      </section>
      </div>
    </div>
  );
}

export function FirebasePicksPanels({
  children,
  andAnotherThingInitialPosts,
  showAndAnotherThingInGrid = true,
}: {
  children: ReactNode;
  andAnotherThingInitialPosts: AnotherThingPost[];
  /** When false, the grid strip is omitted (2xl+ uses the sidebar instance only). */
  showAndAnotherThingInGrid?: boolean;
}) {
  const configHint = !isFirebaseClientConfigured();

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-5">
      {configHint && (
        <div className="rounded-xl border border-[var(--hub-warn-border)] bg-[var(--hub-warn-bg)] px-4 py-3 text-sm text-[var(--hub-on-tint)] leading-relaxed">
          Firebase is not configured. Copy{' '}
          <code className="text-xs bg-[var(--hub-inset)] px-1.5 py-0.5 rounded">.env.example</code> to{' '}
          <code className="text-xs bg-[var(--hub-inset)] px-1.5 py-0.5 rounded">.env.local</code>, add your
          web app keys and Realtime Database URL, then restart{' '}
          <code className="text-xs bg-[var(--hub-inset)] px-1.5 py-0.5 rounded">npm run dev</code>.
        </div>
      )}
      {/*
        md: 3×2 — left: App / Video; centre: How apps (row-span 2); right: coming-soon+ProphIt (row-span 2).
        md to <2xl: And Another Thing… compact strip under the grid (full width); 2xl: microblog+blog in right rail only.
        max-md: BPL → How apps → blog → AAT… → Coming soon → Video (order-*); blog hidden md+ (md rail / 2xl right column).
      */}
      <div className="grid grid-cols-1 gap-4 max-md:[grid-template-rows:repeat(6,minmax(0,26rem))] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,1.3fr)] md:gap-5 md:max-2xl:[grid-template-rows:minmax(0,26rem)_minmax(0,26rem)_minmax(0,14rem)] 2xl:[grid-template-rows:minmax(0,26rem)_minmax(0,26rem)] [&>*]:min-h-0 [&>*]:min-w-0">
        <div className="min-h-0 h-full flex flex-col max-md:order-1 md:order-none md:col-start-1 md:row-start-1">
          {children}
        </div>
        <div className="min-h-0 max-md:order-6 md:order-none md:col-start-1 md:row-start-2">
          <BestPicksVideo />
        </div>
        <div className="flex min-h-0 flex-col max-md:order-2 md:order-none md:col-start-2 md:row-start-1 md:row-span-2 md:h-full md:min-h-0">
          <BestPicksHowAppsWorkPanel />
        </div>
        <div className="min-h-0 min-w-0 flex max-md:order-3 max-md:max-h-[min(32rem,70vh)] max-md:overflow-y-auto md:hidden">
          <BestPicksBlogPreviewsRail />
        </div>
        <div
          className={
            showAndAnotherThingInGrid
              ? 'min-h-0 min-w-0 max-md:order-4 md:max-2xl:col-span-3 md:max-2xl:row-start-3 2xl:hidden'
              : 'hidden'
          }
        >
          {showAndAnotherThingInGrid ? (
            <AndAnotherThingHubPreview initialPosts={andAnotherThingInitialPosts} variant="gridCompact" />
          ) : null}
        </div>
        <div className="flex min-h-0 min-w-0 h-full flex-col max-md:order-5 md:order-none md:col-start-3 md:row-start-1 md:row-span-2 md:h-full">
          <BestPicksComingSoonAndProphitPanel />
        </div>
      </div>
    </div>
  );
}

// Over 2.5 / Under 2.5 pick tiles + Firebase listeners: full copy preserved in
// `FirebasePicksPanels.over-under-panels.archive.txt` for restore — copy from there into this file
// and wire grid order as needed.
