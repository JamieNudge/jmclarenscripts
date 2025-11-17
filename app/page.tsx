'use client';

import { useState } from 'react';
import AppCarousel from '@/components/AppCarousel';
import AppDetailModal from '@/components/AppDetailModal';
import { apps } from '@/lib/apps-data';
import { App } from '@/types/app';

export default function Home() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col">
      {/* Compact Hero section */}
      <section className="relative z-10 pt-8 pb-4 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight">
            Jamie&apos;s Portfolio
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Crafting innovative mobile & desktop experiences
          </p>
        </div>
      </section>

      {/* 3D Carousel - Centered */}
      <section className="relative z-10 flex-1 flex items-center justify-center">
        <AppCarousel apps={apps} onAppSelect={setSelectedApp} />
      </section>

      {/* Contact/Footer - Compact */}
      <footer className="relative z-10 py-6 px-4 text-center text-white/60">
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
        <p className="mt-4 text-xs opacity-50">
          © {new Date().getFullYear()} Jamie McLaren
        </p>
      </footer>

      {/* App detail modal */}
      <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
    </main>
  );
}

