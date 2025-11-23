import { App } from '@/types/app';

// ADD YOUR APP DATA HERE!
export const apps: App[] = [
  {
    id: 'draw-with-friends',
    name: 'Draw With Friends',
    tagline: 'Real-time collaborative drawing',
    description: 'A fun, interactive iOS app where friends can draw together in real-time. Features include turn-based and simultaneous drawing modes, echo effects, and photo backgrounds.',
    color: '#FF6B9D',
    icon: '/images/draw-with-friends-icon.png',
    screenshots: [
      '/images/draw-with-friends-1.png',
      '/images/draw-with-friends-2.png',
      '/images/draw-with-friends-3.png',
    ],
    features: [
      'Real-time collaboration',
      'Turn-based & simultaneous modes',
      'Echo drawing effects',
      'Photo backgrounds',
      'Room-based sessions',
    ],
    appStoreUrl: 'https://apps.apple.com/your-app',
    platform: 'iOS',
    status: 'live',
  },
  {
    id: 'aikido-vocabulary-app',
    name: 'Aikido Vocabulary App',
    tagline: 'Japanese Language Trainer for students of Aikido',
    description:
      'A focused Japanese vocabulary trainer for Aikido students. Learn key dojo phrases, technique names and etiquette terms with simple drills you can run between classes.',
    // Use a calm indigo/blue that matches the iOS-style screenshots better than brown
    color: '#2563EB',
    icon: '/images/aikido-vocabulary-icon.png',
    screenshots: [
      // First screenshot is used for the card; use the new main shot there
      '/images/aikido-vocab-main.png',
      '/images/aikido-vocab-1.png',
      '/images/aikido-vocab-2.png',
      '/images/aikido-vocab-3.png',
      '/images/aikido-vocab-4.png',
    ],
    features: [
      'Curated Aikido dojo vocabulary',
      'Reading + English meaning for each term',
      'Lightweight on-device progress tracking',
      'No accounts and no ads',
      'Designed for quick review between classes',
    ],
    platform: 'iOS',
    status: 'beta',
    privacyUrl: '/privacy/aikido-vocabulary',
    contentRatingUrl: '/aikido-vocabulary/content-rating',
  },
  {
    id: 'desktop-totem',
    name: 'Desktop Totem',
    tagline: 'Your most-used apps, stacked and ready',
    description:
      'Desktop Totem keeps your most-used Mac apps in a live “totem” on your screen so you can jump back into your real work with a single click.',
    color: '#1E293B',
    icon: '/images/desktop-totem-icon.png',
    screenshots: ['/images/desktop-totem-1.png'],
    features: [
      'Live ranking of your most-used apps',
      'Slim menu bar popover and optional desktop totem',
      'Always-on-top mode with one-click “hide others”',
      'Per-app quick notes (“what was I working on?”)',
      'VoiceOver-friendly navigation with clear labels',
    ],
    platform: 'macOS',
    status: 'beta',
    accessibilityUrl: '/accessibility/desktop-totem',
  },
  {
    id: 'nudgetronic',
    name: 'Nudgetronic',
    tagline: 'Screen time management done right',
    description: 'Take control of your digital wellbeing with smart app blocking, grace periods, and auto-end timers.',
    color: '#4A90E2',
    icon: '/images/nudgetronic-icon.png',
    screenshots: [
      '/images/nudgetronic-1.png',
      '/images/nudgetronic-2.png',
    ],
    features: [
      'Full-screen shields',
      '2-minute grace periods',
      'Auto-end timers',
      'Web domain blocking',
      'Category-based limits',
    ],
    appStoreUrl: 'https://apps.apple.com/gb/app/nudgetronic/id6752445547',
    platform: 'iOS',
    status: 'live',
  },
  {
    id: 'doomscroll-stopper',
    name: 'Doomscroll Stopper',
    tagline: 'Break the scroll, reclaim your time',
    description: 'Stop endless scrolling with intelligent app blocking and mindful usage reminders. Take back control of your digital habits.',
    // Warm orange that matches the app's highlight colour better than pink
    color: '#F97316',
    icon: '/images/doomscroll-stopper-icon.png',
    screenshots: [
      '/images/doomscroll-stopper-1.png',
      '/images/doomscroll-stopper-2.png',
    ],
    features: [
      'Smart scroll detection',
      'Usage time limits',
      'Break reminders',
      'App blocking',
      'Daily insights',
    ],
    appStoreUrl: 'https://apps.apple.com/gb/app/doomscroll-stopper/id6754539688',
    platform: 'iOS',
    status: 'live',
  },
];

