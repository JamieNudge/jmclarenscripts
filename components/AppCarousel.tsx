'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
                    backgroundColor: app.color,
                    backgroundImage: `linear-gradient(135deg, ${app.color} 0%, ${app.color}dd 100%)`,
                  }}
                >
                  {/* Phone mockup frame */}
                  <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                    {/* Status bar area */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full" />
                    
                    {/* App icon */}
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
                      <span className="text-4xl">{app.name[0]}</span>
                    </div>

                    {/* App name */}
                    <h3 className="text-white text-2xl font-bold mb-2 text-center px-4">
                      {app.name}
                    </h3>

                    {/* Tagline */}
                    <p className="text-white/90 text-sm text-center px-6 mb-4">
                      {app.tagline}
                    </p>

                    {/* Platform badge */}
                    <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <span className="text-white text-xs font-semibold">
                        {app.platform}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute bottom-6 right-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        app.status === 'live' ? 'bg-green-400 text-green-900' :
                        app.status === 'beta' ? 'bg-yellow-400 text-yellow-900' :
                        'bg-purple-400 text-purple-900'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
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

