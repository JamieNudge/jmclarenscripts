'use client';

import { useState } from 'react';
import AppCarousel from '@/components/AppCarousel';
import AppDetailModal from '@/components/AppDetailModal';
import { apps } from '@/lib/apps-data';
import { App } from '@/types/app';

export default function Home() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  return (
    <main className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Hero Bar - Top */}
      <header className="relative z-10 py-4 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Jamie&apos;s Portfolio
            </h1>
            <p className="text-sm text-white/70">
              Mobile & Desktop Apps
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-white/80">
            <span className="text-sm">{apps.filter(app => app.status === 'live').length} Live Apps</span>
          </div>
        </div>
      </header>

      {/* 3D Carousel - Center (fills remaining space) */}
      <section className="relative z-10 flex-1 flex items-center justify-center">
        <AppCarousel apps={apps} onAppSelect={setSelectedApp} />
      </section>

      {/* Footer Bar - Bottom */}
      <footer className="relative z-10 py-4 px-6 bg-black/20 backdrop-blur-sm text-center text-white/80">
        <div className="flex gap-6 justify-center text-sm">
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
      </footer>

      {/* App detail modal */}
      <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
    </main>
  );
}

