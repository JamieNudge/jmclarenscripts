import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Hostnames that should show only the Football Predictions hub (+ blog), not the portfolio home.
 * Comma-separated. Override in Vercel: HUB_ONLY_HOSTS=thegoallab.net,www.thegoallab.net
 */
const DEFAULT_HUB_HOSTS = 'thegoallab.net,www.thegoallab.net';

/**
 * Where to send visitors who hit portfolio-only paths on a hub host (your main deployed URL).
 * Override in Vercel: PRIMARY_PUBLIC_URL=https://jmclarenscripts.vercel.app
 */
const DEFAULT_PRIMARY = 'https://jmclarenscripts.vercel.app';

function hubHostSet(): Set<string> {
  const raw = process.env.HUB_ONLY_HOSTS ?? DEFAULT_HUB_HOSTS;
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

function primaryBase(): string {
  const u = (process.env.PRIMARY_PUBLIC_URL ?? DEFAULT_PRIMARY).trim().replace(/\/$/, '');
  return u || DEFAULT_PRIMARY.replace(/\/$/, '');
}

function isHubHost(request: NextRequest): boolean {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  return !!host && hubHostSet().has(host);
}

const PASSTHROUGH_PREFIXES = ['/_next', '/football-predictions', '/blog', '/api', '/images', '/icons'];

const PASSTHROUGH_FILES = new Set([
  '/favicon.ico',
  '/icon.png',
  '/robots.txt',
  '/ads.txt',
  '/app-ads.txt',
]);

export function middleware(request: NextRequest) {
  if (!isHubHost(request)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  // Hub “home” is the football predictions page (URL stays /)
  if (pathname === '/' || pathname === '') {
    return NextResponse.rewrite(new URL('/football-predictions', request.url));
  }

  // Cleaner URL: /football-predictions → /
  if (pathname === '/football-predictions' || pathname === '/football-predictions/') {
    const u = request.nextUrl.clone();
    u.pathname = '/';
    return NextResponse.redirect(u, 308);
  }

  if (PASSTHROUGH_FILES.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  for (const prefix of PASSTHROUGH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return NextResponse.next();
    }
  }

  const dest = `${primaryBase()}${pathname}${search}`;
  return NextResponse.redirect(dest, 308);
}

export const config = {
  matcher: [
    /*
     * Run for all pathnames except Next static assets and common image extensions (faster).
     */
    '/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp)$).*)',
  ],
};
