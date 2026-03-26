'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlueskyLink } from '@/components/BlueskyLink';
import { App } from '@/types/app';
import Image from 'next/image';

interface AppCarouselProps {
  apps: App[];
  onAppSelect: (app: App) => void;
}

export default function AppCarousel({ apps, onAppSelect }: AppCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);

  const handleDragEnd = (_: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Threshold for changing slides
    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      if (offset > 0 || velocity > 0) {
        // Dragged right - go to previous
        goToPrevious();
      } else {
        // Dragged left - go to next
        goToNext();
      }
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % apps.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + apps.length) % apps.length);
  };

  // Calculate positions for 3D carousel effect
  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const totalCards = apps.length;
    
    // Normalize diff to be in range [-totalCards/2, totalCards/2]
    let normalizedDiff = diff;
    if (normalizedDiff > totalCards / 2) normalizedDiff -= totalCards;
    if (normalizedDiff < -totalCards / 2) normalizedDiff += totalCards;

    const angle = (normalizedDiff * 360) / totalCards;
    const radius = 400; // Distance from center
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius - radius;
    const scale = 1 - Math.abs(normalizedDiff) * 0.15;
    const opacity = Math.abs(normalizedDiff) > 2 ? 0 : 1 - Math.abs(normalizedDiff) * 0.2;

    return {
      x,
      z,
      scale,
      opacity,
      rotateY: -angle * 0.3,
    };
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
      {/* Instruction text */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/60 text-sm z-50">
        ← Drag or click arrows to explore →
      </div>

      {/* 3D Carousel container */}
      <div className="relative w-full h-full" style={{ perspective: '1000px' }}>
        <AnimatePresence>
          {apps.map((app, index) => {
            const style = getCardStyle(index);
            const isCenter = index === currentIndex;

            return (
              <motion.div
                key={app.id}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                  isCenter ? 'z-20' : 'z-10'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
                initial={false}
                animate={{
                  x: style.x,
                  z: style.z,
                  scale: style.scale,
                  opacity: style.opacity,
                  rotateY: style.rotateY,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 30,
                }}
                drag={isCenter ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (isCenter) {
                    onAppSelect(app);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
              >
                <div
                  className={`relative w-[280px] h-[500px] rounded-3xl overflow-hidden shadow-2xl transition-all ${
                    isCenter ? 'ring-4 ring-white/30' : ''
                  }`}
                  style={{
                    backgroundColor: '#1a1a1a',
                  }}
                >
                  {/* Phone mockup with screenshot */}
                  <div className="relative w-full h-full">
                    {/* Status bar notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl z-20" />
                    
                    {/* Screenshot as background */}
                    {app.screenshots[0] ? (
                      <img
                        src={app.screenshots[0]}
                        alt={app.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback if no screenshot
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${app.color} 0%, ${app.color}dd 100%)`,
                        }}
                      >
                        <div className="text-center">
                          <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 mx-auto">
                            <span className="text-4xl">{app.name[0]}</span>
                          </div>
                          <h3 className="text-white text-xl font-bold px-4">
                            {app.name}
                          </h3>
                        </div>
                      </div>
                    )}

                    {/* App name overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6 pt-12">
                      <h3 className="text-white text-xl font-bold mb-1 break-words">
                        {app.name}
                      </h3>
                      <p className="text-white/80 text-xs break-words">
                        {app.tagline}
                      </p>
                    </div>

                    {/* Status badge(s) */}
                    <div className="absolute top-12 right-4 z-20 flex flex-col items-end gap-2 max-w-[85%]">
                      <div className="flex flex-wrap gap-1 justify-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          app.status === 'live' ? 'bg-green-400 text-green-900' :
                          app.status === 'beta' ? 'bg-yellow-400 text-yellow-900' :
                          app.status === 'in-review' ? 'bg-blue-400 text-blue-900' :
                          'bg-purple-400 text-purple-900'
                        }`}>
                          {app.status === 'in-review' ? 'App Store Review' : app.status.toUpperCase()}
                        </span>
                        {app.googlePlayStatus && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                            app.googlePlayStatus === 'in-review' ? 'bg-blue-400 text-blue-900' :
                            app.googlePlayStatus === 'live' ? 'bg-green-400 text-green-900' :
                            'bg-yellow-400 text-yellow-900'
                          }`}>
                            {app.googlePlayStatus === 'in-review' ? 'Google Play Review' : app.googlePlayStatus.toUpperCase()}
                          </span>
                        )}
                        {app.appStoreUrl && app.appStoreTrialNote ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-white/95 text-gray-900 border border-white/50">
                            {app.appStoreTrialNote}
                          </span>
                        ) : null}
                      </div>
                      {isCenter && app.blueskyUrl && (
                        <BlueskyLink
                          href={app.blueskyUrl}
                          subtitle={app.blueskyLabel}
                          variant="pill"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all flex items-center justify-center group"
        aria-label="Previous app"
      >
        <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all flex items-center justify-center group"
        aria-label="Next app"
      >
        <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {apps.map((app, index) => (
          <button
            key={app.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to ${app.name}`}
          />
        ))}
      </div>
    </div>
  );
}

