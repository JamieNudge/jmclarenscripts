import { Inter } from 'next/font/google';

/** Single Inter instance for the app (layout + blog emoji stack). */
export const inter = Inter({ subsets: ['latin'] });

/**
 * Body text stack: Inter first, then system UI, then color-emoji fonts so 🎉 etc. render in titles
 * and markdown (Latin-only Inter does not ship emoji glyphs).
 */
export const blogTextFontFamily: string = [
  inter.style.fontFamily,
  'ui-sans-serif',
  'system-ui',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
  'sans-serif',
].join(', ');

/** Admin markdown textarea: monospace for editing, with color-emoji fonts so previews match posts. */
export const blogMarkdownComposerFontFamily: string = [
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
  'monospace',
].join(', ');
