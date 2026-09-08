import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Draw With Friends — Support',
  description:
    'Help for Draw With Friends: room codes, up to 4 devices, sharing drawings, photo backgrounds, and how to contact support.',
};

export default function DrawWithFriendsSupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">Draw With Friends — Support</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: September 8, 2026</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>Need help? Check the questions below, or email us.</p>

          <h2 className="text-xl font-semibold text-white mt-8">How do I start drawing with someone?</h2>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Choose Simultaneous or Turn-Based</li>
            <li>Tap Create New Room</li>
            <li>Share the 6-digit room code (copy or share from the canvas)</li>
            <li>They tap Join Room and type the code</li>
            <li>Draw together — up to 4 devices can be in the same room</li>
          </ol>

          <h2 className="text-xl font-semibold text-white mt-8">How many people can join a room?</h2>
          <p>
            Up to 4 devices. A fifth join is told the room is full — start a new room and share that code
            instead.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">They can&apos;t see my drawing. What&apos;s wrong?</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Check that both devices are online</li>
            <li>Make sure you all entered the same 6-digit code</li>
            <li>Leave and join the room again</li>
            <li>In Turn-Based mode, wait until it is your turn</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">
            What&apos;s the difference between Simultaneous and Turn-Based?
          </h2>
          <p>
            <span className="font-semibold">Simultaneous:</span> everyone draws at the same time. Best for
            families and kids drawing together.
          </p>
          <p>
            <span className="font-semibold">Turn-Based:</span> one person draws at a time. Better for taking
            turns on the same picture.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">How do I save or share my drawing?</h2>
          <p>
            Tap the share button (square with an arrow) on the canvas. You can send it to Photos, Messages,
            Mail, and other apps. Share anything you want to keep before the room ends.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Can I put a photo behind the drawing?</h2>
          <p>
            Yes. Tap the photo button, then pick a picture. It is resized and shared with everyone in that
            room (up to 4 people). Only import photos you are happy for the others to see.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">How does Echo work?</h2>
          <p>
            Tap Echo to turn it on. Use + and − to set how many copies (up to 10). Your strokes repeat for a
            pattern effect.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">How long do rooms stay active?</h2>
          <p>
            A room is deleted when the last person leaves. If nobody draws for 24 hours, the code expires.
            Save or share artwork you want to keep.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Do I need to create an account?</h2>
          <p>
            No. There is no login, no account, and no personal information required. Open the app and start
            drawing. See the{' '}
            <Link href="/privacy/draw-with-friends" className="underline hover:text-blue-300">
              privacy policy
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">What iOS version do I need?</h2>
          <p>iOS 16.0 or later.</p>

          <h2 className="text-xl font-semibold text-white mt-8">Contact</h2>
          <p>
            Email:{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Draw%20With%20Friends%20support"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
          <p>We typically respond within 24–48 hours. Please include your iOS version and a short description of the issue.</p>
        </section>
      </div>
    </main>
  );
}
