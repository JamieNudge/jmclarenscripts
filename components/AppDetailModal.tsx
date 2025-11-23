'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { App } from '@/types/app';

interface AppDetailModalProps {
  app: App | null;
  onClose: () => void;
}

export default function AppDetailModal({ app, onClose }: AppDetailModalProps) {
  if (!app) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header with gradient */}
          <div
            className="relative h-64 flex flex-col items-center justify-center text-white p-8"
            style={{
              background: `linear-gradient(135deg, ${app.color} 0%, ${app.color}dd 100%)`,
            }}
          >
            <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-4 overflow-hidden">
              {app.icon ? (
                <img
                  src={app.icon}
                  alt={`${app.name} icon`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-5xl">{app.name[0]}</span>
              )}
            </div>
            <h2 className="text-4xl font-bold mb-2">{app.name}</h2>
            <p className="text-xl text-white/90">{app.tagline}</p>
            <div className="flex gap-3 mt-4">
              <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm text-sm font-semibold">
                {app.platform}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                app.status === 'live' ? 'bg-green-400 text-green-900' :
                app.status === 'beta' ? 'bg-yellow-400 text-yellow-900' :
                'bg-purple-400 text-purple-900'
              }`}>
                {app.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Description */}
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {app.description}
              </p>
            </section>

            {/* Features */}
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {app.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Screenshots */}
            {app.screenshots.length > 0 && (
              <section className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Screenshots</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {app.screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-64 h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/60"
                    >
                      <img
                        src={screenshot}
                        alt={`${app.name} screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4">
              {app.appStoreUrl && (
                <a
                  href={app.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-full font-semibold text-white transition-transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: app.color }}
                >
                  {app.platform === 'iOS' ? 'View on App Store' : 'Download'}
                </a>
              )}
              {app.websiteUrl && (
                <a
                  href={app.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gray-200 dark:bg-gray-800 rounded-full font-semibold text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Visit Website
                </a>
              )}
              {app.privacyUrl && (
                <a
                  href={app.privacyUrl}
                  className="px-8 py-4 border border-gray-300 dark:border-gray-700 rounded-full font-semibold text-gray-900 dark:text-white bg-white/80 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  Privacy Policy
                </a>
              )}
              {app.contentRatingUrl && (
                <a
                  href={app.contentRatingUrl}
                  className="px-8 py-4 border border-gray-300/70 dark:border-gray-700/70 rounded-full font-semibold text-gray-900 dark:text-white bg-transparent hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                >
                  Age &amp; Content Rating
                </a>
              )}
              {app.accessibilityUrl && (
                <a
                  href={app.accessibilityUrl}
                  className="px-8 py-4 border border-gray-300/70 dark:border-gray-700/70 rounded-full font-semibold text-gray-900 dark:text-white bg-transparent hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                >
                  Accessibility
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

