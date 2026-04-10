import Link from 'next/link';
import { apps } from '@/lib/apps-data';

const statStrike = apps.find((a) => a.id === 'stat-strike');
const goalLab = apps.find((a) => a.id === 'goallab');

/**
 * Hero + expandable methodology for `/best-picks`.
 * Copy is scoped to what this page and linked apps actually do (Firebase feeds + in-app pipelines).
 */
export function BestPicksIntro() {
  const ssUrl = statStrike?.appStoreUrl;
  const glUrl = goalLab?.appStoreUrl;

  return (
    <header className="max-w-4xl mb-8 md:mb-10 space-y-5">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white">
        <span className="block">Today&apos;s Best Picks</span>
        <span className="block mt-3 md:mt-4 text-lg md:text-xl lg:text-2xl font-semibold text-amber-50/90 leading-snug">
          Selected by filtering the work of four different algorithms and what each does best!
        </span>
      </h1>

      <p className="text-sm md:text-base text-white/70 leading-relaxed">
        Statistical views of recent match patterns—not outcomes you should treat as guaranteed. Everything
        below updates from{' '}
        <span className="text-amber-100/85 font-medium">Firebase</span> when your uploaders sync.
      </p>

      <ul className="space-y-2.5 text-sm md:text-[0.9375rem] text-white/75 leading-relaxed border-l-2 border-amber-400/25 pl-4">
        <li>
          <span className="font-semibold text-amber-100/90">StatStrike</span> — In-app daily selection with
          criteria-style confidence on goal bands.{' '}
          {ssUrl ? (
            <a
              href={ssUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200/90 underline underline-offset-2 decoration-amber-400/40 hover:decoration-amber-300/70"
            >
              App Store
            </a>
          ) : null}
        </li>
        <li>
          <span className="font-semibold text-amber-100/90">GoalLab</span> — Four independent statistical models
          on Over / Under 2.5; curated picks when models align.{' '}
          {glUrl ? (
            <a
              href={glUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200/90 underline underline-offset-2 decoration-amber-400/40 hover:decoration-amber-300/70"
            >
              App Store
            </a>
          ) : null}
        </li>
        <li>
          <span className="font-semibold text-amber-100/90">This page</span> — Public snapshot: merged Over /
          Under 2.5 from <code className="text-[11px] text-white/45">unanimousExports</code> +{' '}
          <code className="text-[11px] text-white/45">manualExports</code>, league context from{' '}
          <code className="text-[11px] text-white/45">selections</code>, and (when uploaded) the All Models research
          strip from <code className="text-[11px] text-white/45">researchAlgorithmSelections</code> /{' '}
          <code className="text-[11px] text-white/45">dailyConsensusSelections</code>.
        </li>
      </ul>

      <details className="group rounded-xl border border-amber-200/15 bg-black/25 px-4 py-3 md:px-5 md:py-4">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-sm font-semibold text-amber-50/95 hover:text-amber-50 [&::-webkit-details-marker]:hidden">
          <span>How the algorithms work!</span>
          <svg
            className="w-4 h-4 text-amber-200/50 shrink-0 transition-transform duration-200 group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-4 pt-3 border-t border-white/10 space-y-4 text-sm text-white/70 leading-relaxed">
          <p>
            Picks you see are <strong className="font-medium text-white/85">informational</strong>: they highlight
            where historical stats and model rules agreed at upload time. They are not betting tips, promises, or
            financial advice.
          </p>
          <p>
            <strong className="font-medium text-white/85">Over / Under 2.5</strong> tiles combine automated exports
            with any manual rows, then (when available) restrict to leagues marked as best-performing in the uploaded
            archive (same idea as the in-app chip: strong historical win rate in that league).
          </p>
          <p>
            <strong className="font-medium text-white/85">GoalLab</strong> (in-app) runs four separate models on the
            2.5-goal market and surfaces agreement-heavy lines. <strong className="font-medium text-white/85">
              StatStrike
            </strong>{' '}
            uses its own selection and criteria pipeline in the app you download—this website only mirrors the public
            Firebase snapshot for the calendar date shown.
          </p>
          <p>
            <strong className="font-medium text-white/85">Percentages on pick detail</strong> (e.g. in-app “key
            stats”) use the <strong className="font-medium text-white/85">most recent matches available</strong> for
            each statistic in the forecasting pipeline; the sample behind each line can differ. Labels come from the
            uploader—this page adds that note so nothing here implies a fixed “last six games” window unless the label
            explicitly says so.
          </p>
          <p className="text-xs text-white/50">
            For app-specific terms and privacy, use the links in the App Store tile or the site footer (
            <Link href="/privacy" className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90">
              Privacy policy
            </Link>
            ).
          </p>
        </div>
      </details>
    </header>
  );
}
