import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';

export const metadata: Metadata = {
  title: 'StatStrike — You vs StatStrike competition rules',
  description:
    'Official public rules for You vs StatStrike, a skill contest in the StatStrike iOS app. Beat the app on Over/Under 2.5 fades to win a free month of Premium.',
};

function Rule({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h2 className="text-xl font-semibold mt-8">{title}</h2>
      <p>{children}</p>
    </>
  );
}

export default function StatStrikeCompetitionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white rounded-full bg-white/10 px-4 py-2 border border-white/20 hover:bg-white/15 transition-colors"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back to GoalLab</span>
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          You vs StatStrike — competition rules
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Public copy of the official rules in the StatStrike iOS app. If this page and the in-app
          Rules screen ever differ, the Rules screen in the app is the one that applies. Material
          changes will appear there and here.
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p className="font-semibold">
            StatStrike is the sole sponsor of this competition. Apple Inc. is not a sponsor,
            participant, or involved in this competition in any way.
          </p>

          <p>
            You vs StatStrike is a skill contest in the <span className="font-semibold">StatStrike iOS app</span>.
            Open the Beat StatStrike chip on the fixtures board. Android does not offer this prize
            yet.
          </p>

          <p className="flex flex-wrap gap-x-4 gap-y-2">
            <a
              href={statstrikeAndroidMeta.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              App Store
            </a>
            <a
              href={statstrikeAndroidMeta.playStoreInstallUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              Google Play
            </a>
          </p>

          <Rule title="Eligibility">
            You can Disagree during your first week in the app, or with an active Premium
            subscription. After that first week, Disagree is locked until you subscribe. There is no
            extra weekly plan. One App Store account can claim one prize at a time — two devices
            signed into the same Apple ID still share one prize.
          </Rule>

          <Rule title="How to play">
            Tap Disagree on an Over 2.5 or Under 2.5 tip before kick-off. You take the other side of
            StatStrike’s pick. Other markets (BTTS, Over 3.5, and so on) are not in this contest. One
            fade per match. There is no select-all. You may remove a fade only before kick-off; after
            kick-off it stays.
          </Rule>

          <Rule title="What counts">
            The prize uses fades accepted by StatStrike’s server before kick-off. The chip on your
            phone is a live score. If they differ, the server result stands. Intro-week fades count
            only if they were accepted before kick-off. We do not upload old history from your phone
            when you subscribe. A fade belongs to the Europe/London week of that match’s kick-off, not
            the moment you tapped.
          </Rule>

          <Rule title="This week">
            A contest week is Monday to Sunday, Europe/London. It is finalized on Monday at 12:00
            London so Sunday-night full times can land. You can still Disagree on Sunday. Matches with
            no full time at finalize do not count. Postponed, abandoned, or cancelled matches are
            dropped and do not count toward 25. A push (neither side uniquely right) counts toward 25
            settled, but not toward You or StatStrike.
          </Rule>

          <Rule title="How you win">
            When the week is finalized you need at least 25 settled fades and more wins than
            StatStrike. Draws do not win. 25 is a minimum, not a cap — every settled fade that week
            still counts. Ahead after 25, you can still lose the week. Behind after 25, you can still
            come back. Mid-week download is fine; you do not have to have been here on Monday.
          </Rule>

          <Rule title="Thin weeks">
            If StatStrike published fewer than 25 Over/Under 2.5 tips that week, there is no prize.
            That week is exhibition only. You did not fail the volume rule.
          </Rule>

          <Rule title="The prize">
            The prize is one free month of the existing Premium subscription. There is no cash
            alternative, no transfer, and no other product. You must have an active paid subscription
            to claim. Intro-week play can set up a win; intro without paying cannot collect. Claim is
            open for 7 days after Monday 12:00 London finalize.
          </Rule>

          <Rule title="How to claim">
            Tap the Beat StatStrike chip to open this week’s scorecard. After Monday 12:00 London
            finalize, if you finished ahead with at least 25 settled fades, Claim free month appears
            on that scorecard and on the chip. If you are not already on Premium, subscribe first, then
            tap Claim. Apple applies one free month to your existing subscription — there is no code,
            no new product, and no separate checkout. Miss the 7-day window and that week’s prize is
            gone.
          </Rule>

          <Rule title="After you claim">
            After you claim, the next month is free, then you pay the month after that before you can
            claim again. That cooldown is two calendar months, Europe/London, on your App Store
            account. You can still play every week in between. The score still updates; Claim stays
            off until the cooldown ends.
          </Rule>

          <Rule title="Skill, not gambling">
            This is a game of skill against StatStrike’s own forecasts. You do not stake money on
            matches and we do not take bets. StatStrike does not use a bookmaker feed for this
            contest.
          </Rule>

          <Rule title="Changing these rules">
            StatStrike may refuse a claim that fails the server checks, and may change or end this
            contest. If this page and the in-app Rules screen ever differ, the Rules screen in the
            app is the one that applies. Material changes will appear there and here.
          </Rule>

          <h2 className="text-xl font-semibold mt-8">Age 18+</h2>
          <p>
            StatStrike is for users aged 18 or older. Age, terms, and contact details are on{' '}
            <Link href="/terms/statstrike" className="underline hover:text-blue-300">
              StatStrike Terms of Use
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
