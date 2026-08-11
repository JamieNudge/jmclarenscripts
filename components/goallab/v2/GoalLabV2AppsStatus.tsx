import Image from 'next/image';
import Link from 'next/link';
import { apps } from '@/lib/apps-data';

const goalLab = apps.find((a) => a.id === 'goallab');
const statStrike = apps.find((a) => a.id === 'stat-strike');
const popGoals = apps.find((a) => a.id === 'popgoals');

type StatusItem = {
  name: string;
  iconSrc?: string;
  status: string;
  body: string;
  href?: string;
  hrefLabel?: string;
  external?: boolean;
  trialNote?: string;
};

const items: StatusItem[] = [
  ...(goalLab?.appStoreUrl
    ? [
        {
          name: 'GoalLab',
          iconSrc: goalLab.icon,
          status: 'Live · iOS',
          body: 'Quick access forecasts on iPhone — the mobile companion to this desktop hub.',
          href: goalLab.appStoreUrl,
          hrefLabel: 'App Store',
          external: true,
          trialNote: goalLab.appStoreTrialNote,
        } satisfies StatusItem,
      ]
    : []),
  ...(statStrike?.appStoreUrl
    ? [
        {
          name: 'StatStrike',
          iconSrc: statStrike.icon,
          status: 'Live · iOS',
          body: 'Subscription forecasting app with confidence gauges and track record.',
          href: statStrike.appStoreUrl,
          hrefLabel: 'App Store',
          external: true,
          trialNote: statStrike.appStoreTrialNote,
        } satisfies StatusItem,
      ]
    : []),
  ...(popGoals?.appStoreUrl
    ? [
        {
          name: 'PopGoals',
          iconSrc: popGoals.icon,
          status: 'Live · iOS',
          body: 'Live match intelligence with hot-zone targets and fixture lifecycle states.',
          href: popGoals.appStoreUrl,
          hrefLabel: 'App Store',
          external: true,
          trialNote: popGoals.appStoreTrialNote,
        } satisfies StatusItem,
      ]
    : []),
  {
    name: 'ProphIt',
    status: 'Coming soon',
    body: 'Research service to turn your own prediction ideas into a tracked live model.',
    href: '/privacy/prophit',
    hrefLabel: 'Privacy policy',
    external: false,
  },
];

export function GoalLabV2AppsStatus() {
  return (
    <section
      className="rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] px-5 py-6 md:px-8 md:py-8 shadow-[var(--gl-shadow)] space-y-6"
      aria-labelledby="gl-v2-apps-heading"
    >
      <div className="max-w-2xl">
        <h2 id="gl-v2-apps-heading" className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--gl-text)]">
          Apps & status
        </h2>
        <p className="mt-2 text-sm text-[var(--gl-text-soft)] leading-relaxed">
          This site is the desktop companion. Here is what is live, in testing, or still in development.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 list-none m-0 p-0">
        {items.map((item) => {
          const linkClass =
            'text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline';
          return (
            <li
              key={item.name}
              className="flex gap-3 rounded-xl border border-[var(--gl-border)] bg-[var(--gl-page)] p-4"
            >
              {item.iconSrc ? (
                <Image
                  src={item.iconSrc}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-lg shrink-0 h-10 w-10 object-cover"
                />
              ) : (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--gl-border)] bg-[var(--gl-elevated)] text-xs font-semibold text-[var(--gl-text-soft)]"
                  aria-hidden
                >
                  {item.name.slice(0, 2)}
                </span>
              )}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-[var(--gl-text)]">{item.name}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--gl-text-muted)]">
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--gl-text-soft)] leading-relaxed">{item.body}</p>
                {item.href && item.hrefLabel ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {item.hrefLabel} →
                      </a>
                    ) : (
                      <Link href={item.href} className={linkClass}>
                        {item.hrefLabel} →
                      </Link>
                    )}
                    {item.trialNote ? (
                      <span className="text-[11px] font-medium text-[var(--gl-text-muted)]">
                        {item.trialNote}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
