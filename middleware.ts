import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { HUB_FP_SLUG_SET, parseHubHostList } from '@/lib/hub-football-routes';

const DEFAULT_PRIMARY = 'https://jmclarenscripts.vercel.app';

function primaryBase(): string {
  const u = (process.env.PRIMARY_PUBLIC_URL ?? DEFAULT_PRIMARY).trim().replace(/\/$/, '');
  return u || DEFAULT_PRIMARY.replace(/\/$/, '');
}

function isHubHost(request: NextRequest): boolean {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  return !!host && parseHubHostList().has(host);
}

const PASSTHROUGH_FILES = new Set([
  '/favicon.ico',
  '/icon.png',
  '/robots.txt',
  '/ads.txt',
  '/app-ads.txt',
]);

function redirectStripFpPrefix(request: NextRequest, restWithSlash: string): NextResponse {
  const u = request.nextUrl.clone();
  const path = restWithSlash.startsWith('/') ? restWithSlash : `/${restWithSlash}`;
  u.pathname = path || '/';
  return NextResponse.redirect(u, 308);
}

export function middleware(request: NextRequest) {
  if (!isHubHost(request)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/' || pathname === '') {
    return NextResponse.rewrite(new URL('/football-predictions', request.url));
  }

  if (PASSTHROUGH_FILES.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images/') ||
    pathname === '/images' ||
    pathname.startsWith('/icons/') ||
    pathname === '/icons'
  ) {
    return NextResponse.next();
  }

  // Long hub URLs → short canonical URLs on GoalLab
  if (pathname === '/football-predictions' || pathname === '/football-predictions/') {
    const u = request.nextUrl.clone();
    u.pathname = '/';
    return NextResponse.redirect(u, 308);
  }

  if (pathname.startsWith('/football-predictions/')) {
    const rest = pathname.slice('/football-predictions'.length);
    const segment = rest.replace(/^\//, '').split('/')[0] ?? '';
    if (segment && HUB_FP_SLUG_SET.has(segment)) {
      return redirectStripFpPrefix(request, rest.startsWith('/') ? rest : `/${rest}`);
    }
    return NextResponse.next();
  }

  // Short hub paths → internal football-predictions routes
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0] ?? '';
  if (first && HUB_FP_SLUG_SET.has(first)) {
    return NextResponse.rewrite(new URL(`/football-predictions/${parts.join('/')}`, request.url));
  }

  const { search } = request.nextUrl;
  const dest = `${primaryBase()}${pathname}${search}`;
  return NextResponse.redirect(dest, 308);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp)$).*)',
  ],
};
