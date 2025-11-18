'use client';

import { useState } from 'react';
import AppCarousel from '@/components/AppCarousel';
import AppDetailModal from '@/components/AppDetailModal';
import { apps } from '@/lib/apps-data';
import { App } from '@/types/app';

export default function Home() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Hero section */}
      <section className="relative z-10 pt-8 pb-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Jamie&apos;s Portfolio
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-2xl mx-auto">
            Crafting innovative mobile & desktop experiences
          </p>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            From collaborative drawing apps to productivity tools,
            explore my collection of apps built with passion.
          </p>
        </div>
      </section>

      {/* 3D Carousel */}
      <section className="relative z-50 py-12 mb-40 min-h-[700px] flex items-center justify-center">
        <AppCarousel apps={apps} onAppSelect={setSelectedApp} />
      </section>

      {/* Stats section */}
      <section className="relative z-10 py-16 px-4 mt-40">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-white mb-2">{apps.length}</div>
            <div className="text-white/70">Apps</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-white mb-2">
              {apps.filter(app => app.status === 'live').length}
            </div>
            <div className="text-white/70">Live</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-white mb-2">
              {apps.reduce((acc, app) => acc + app.features.length, 0)}
            </div>
            <div className="text-white/70">Features</div>
          </div>
        </div>
      </section>

      {/* Contact/Footer */}
      <footer className="relative z-10 py-12 px-4 text-center text-white/60">
        <p className="mb-4">Want to collaborate or learn more?</p>
        <div className="flex gap-6 justify-center">
          <a
            href="mailto:jmclarenscripts@gmail.com"
            className="hover:text-white transition-colors"
          >
            Email
          </a>
          <a
            href="https://bsky.app/profile/jmclaren.bsky.social"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Bluesky
          </a>
          <a
            href="https://github.com/JamieNudge"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
        <p className="mt-8 text-sm">
          © {new Date().getFullYear()} Jamie McLaren. All rights reserved.
        </p>
      </footer>

      {/* App detail modal */}
      <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
    </main>
  );
}

