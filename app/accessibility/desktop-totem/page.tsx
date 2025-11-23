import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Desktop Totem — Accessibility',
  description:
    'Accessibility information for Desktop Totem, a macOS productivity app designed to be usable with VoiceOver and keyboard and to minimise visual clutter.',
};

export default function DesktopTotemAccessibilityPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-width mx-auto px-4 py-12 md:py-16 max-w-3xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-fe">
          Desktop Totem — Accessibility
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Desktop Totem is a small macOS productivity app that keeps your most-used apps in a vertical
            “totem” so you can get back to what you were doing more quickly. From the start, the app has
            been built with accessibility in mind and is fully usable with VoiceOver and keyboard input.
          </p>

          <h2 className="text-xl font-semibold mt-6">Vision and Screen Reader Support</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              All interactive elements (menu bar button, app rows, note buttons and controls such as “Pin”,
              “Hide other apps” and “Refresh”) are exposed as standard AppKit/SwiftUI controls.
            </li>
            <li>
              Desktop Totem works with <span className="font-semibold">VoiceOver</span>. Each app row is
              announced with its rank and application name (for example, “1. Mail”, “2. Notes”) and can be
              activated via keyboard or VoiceOver commands.
            </li>
            <li>
              Decorative elements, such as the top icon, are marked as ignored for accessibility so they
              don&apos;t trap focus.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Keyboard and Voice Control</h2>
          <p>
            Desktop Totem uses standard buttons and lists, which makes it compatible with{' '}
            <span className="font-semibold">Voice Control</span> and full keyboard access:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>All primary actions (open app, pin/unpin, hide others, refresh) are simple labelled buttons.</li>
            <li>
              You can navigate the popover and desktop window using standard keyboard navigation and
              VoiceOver commands (for example, VO + arrow keys, or “Click Hide all other apps” with
              Voice Control).
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Visual Design and Contrast</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Desktop Totem uses a dark, high-contrast interface (light text and icons on a dark blue
              background) which can be more comfortable for users with light sensitivity.
            </li>
            <li>
              Information is never conveyed by colour alone. Important states such as an app&apos;s rank,
              notes and pin status are indicated with text labels and icon changes, not just colour shifts.
            </li>
            <li>
              The app relies on system text rendering and standard controls, so it respects macOS settings
              such as Increase contrast and different display profiles.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Motion and Animation</h2>
          <p>
            Desktop Totem uses only subtle UI animations (for example, small hover scale effects when
            moving the pointer over a row). There are no large zooming, spinning or full-screen motion
            effects. At present the app does not implement special behaviour for the system “Reduce Motion”
            setting, but there are no continuous or full-screen animations.
          </p>

          <h2 className="text-xl font-semibold mt-6">Audio, Captions and Haptics</h2>
          <p>
            Desktop Totem does not play audio or video and does not include time-based media, so there is
            no need for captions or audio descriptions within the app. It also does not use haptic feedback.
          </p>

          <h2 className="text-xl font-semibold mt-6">Feedback and Support</h2>
          <p>
            If you use assistive technologies and run into any issues using Desktop Totem, or if you have
            suggestions for improving accessibility, please get in touch:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <span className="font-semibold">Email:</span>{' '}
              <a
                href="mailto:jmclarenscripts@gmail.com"
                className="underline hover:text-blue-300"
              >
                jmclarenscripts@gmail.com
              </a>
            </li>
          </ul>
          <p className="mt-4">
            Accessibility is an ongoing effort. Future updates to Desktop Totem will continue to be tested
            with VoiceOver and other assistive technologies, and this page will be updated as new features
            are added.
          </p>
        </section>
      </div>
    </main>
  );
}


