'use client';

import { useState } from 'react';
import AppDetailModal from '@/components/AppDetailModal';
import { apps } from '@/lib/apps-data';
import { App } from '@/types/app';

export default function Home() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Hero section */}
      <section className="relative z-10 pt-12 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Jamie&apos;s Portfolio
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Crafting innovative mobile & desktop experiences
          </p>
        </div>
      </section>

      {/* Quick Access Thumbnails */}
      <section className="relative z-10 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {apps.map((app) => (
              <button
                key={`thumb-${app.id}`}
                onClick={() => setSelectedApp(app)}
                className="group flex-shrink-0 relative"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-white/50 transition-all duration-300 hover:scale-110">
                  {app.screenshots[0] ? (
                    <img
                      src={app.screenshots[0]}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.name[0]}
                    </div>
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-white/70 group-hover:text-white transition-colors truncate max-w-[80px]">
                    {app.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* App Screenshot */}
                <div className="relative aspect-[9/16] bg-gray-900">
                  {app.screenshots[0] ? (
                    <img
                      src={app.screenshots[0]}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${app.color} 0%, ${app.color}dd 100%)`,
                      }}
                    >
                      <div className="text-white text-6xl font-bold opacity-20">
                        {app.name[0]}
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      app.status === 'live' ? 'bg-green-400 text-green-900' :
                      app.status === 'beta' ? 'bg-yellow-400 text-yellow-900' :
                      'bg-purple-400 text-purple-900'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* App Info */}
                <div className="p-5 text-left">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-sm text-white/70 mb-3">
                    {app.tagline}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="px-2 py-1 bg-white/10 rounded">
                      {app.platform}
                    </span>
                    <span>•</span>
                    <span>{app.features.length} features</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 text-center text-white/70 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-8 justify-center mb-6 text-sm">
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
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} Jamie McLaren. All rights reserved.
          </p>
        </div>
      </footer>

      {/* App detail modal */}
      <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
    </main>
  );
}

