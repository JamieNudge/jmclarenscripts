import { FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH } from '@/lib/football-predictions-brand';

export const bestPicksSiteNavPrimary = [
  { href: '/football-predictions', label: 'Home' },
  { href: FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH, label: 'Research selections' },
  { href: '/football-predictions/methodology', label: 'Methodology' },
  { href: '/football-predictions/about', label: 'About' },
  { href: '/blog', label: 'Blogs' },
] as const;

export const bestPicksSiteNavFooterExtra = [
  { href: '/football-predictions/contact', label: 'Contact' },
  { href: '/football-predictions/privacy', label: 'Privacy policy' },
] as const;
