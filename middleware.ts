import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { shouldInjectAdSenseInInitialHtml } from '@/lib/adsense-initial-html';
import { isDgcHostname } from '@/lib/dgc-hub-routes';
import { HUB_FP_SLUG_SET, footballRouteToGoalLabUrl, isFootballHubPathname, isHubHostname, parseHubHostList } from '@/lib/hub-football-routes';

const DEFAULT_PRIMARY = 'https://jmclarenscripts.vercel.app';
const DEFAULT_DGC_PUBLIC = 'https://dgc.jmclarenscripts.vercel.app';

function primaryBase(): string {
  const u = (process.env.PRIMARY_PUBLIC_URL ?? DEFAULT_PRIMARY).trim().replace(/\/$/, '');
  return u || DEFAULT_PRIMARY.replace(/\/$/, '');
}

function dgcPublicBase(): string {
  const u = (process.env.DGC_PUBLIC_URL ?? DEFAULT_DGC_PUBLIC).trim().replace(/\/$/, '');
  return u || DEFAULT_DGC_PUBLIC.replace(/\/$/, '');
}

function dgcSubdomainEnabled(): boolean {
  return process.env.DGC_SUBDOMAIN_ENABLED === '1';
}

function requestHost(request: NextRequest): string {
  return request.headers.get('host')?.split(':')[0]?.toLowerCase() ?? '';
}

function isHubHost(request: NextRequest): boolean {
  const host = requestHost(request);
  return host.length > 0 && parseHubHostList().has(host);
}

function isDgcHost(request: NextRequest): boolean {
  return isDgcHostname(requestHost(request));
}

const PASSTHROUGH_FILES = new Set([
  '/favicon.ico',
  '/icon.png',
  '/robots.txt',
  '/ads.txt',
  '/app-ads.txt',
]);

function isDirectAppPolicyPath(pathname: string): boolean {
  if (/^\/(privacy|terms|support|accessibility|disclaimer)\/[^/]+(?:\/.*)?$/.test(pathname)) {
    return true;
  }
  return /^\/[^/]+\/content-rating$/.test(pathname);
}

function isStaticAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname === '/images' ||
    pathname.startsWith('/icons/') ||
    pathname === '/icons'
  );
}

function redirectStripFpPrefix(request: NextRequest, restWithSlash: string): NextResponse {
  const u = request.nextUrl.clone();
  const path = restWithSlash.startsWith('/') ? restWithSlash : `/${restWithSlash}`;
  u.pathname = path || '/';
  return NextResponse.redirect(u, 308);
}

function buildForwardedRequestHeaders(request: NextRequest): Headers {
  const pathname = request.nextUrl.pathname || '/';
  const host = requestHost(request);
  const nextHeaders = new Headers(request.headers);
  nextHeaders.set(
    'x-adsense-initial',
    shouldInjectAdSenseInInitialHtml(pathname, host) ? '1' : '0',
  );
  nextHeaders.set('x-goal-lab-hub', isHubHostname(host) ? '1' : '0');
  nextHeaders.set('x-dgc-hub', isDgcHostname(host) ? '1' : '0');
  return nextHeaders;
}

function handleDgcHost(request: NextRequest, forward: { request: { headers: Headers } }) {
  const { pathname } = request.nextUrl;

  if (PASSTHROUGH_FILES.has(pathname) || pathname.startsWith('/.well-known/')) {
    return NextResponse.next(forward);
  }

  if (isDirectAppPolicyPath(pathname) || isStaticAssetPath(pathname)) {
    return NextResponse.next(forward);
  }

  if (pathname === '/dgc' || pathname.startsWith('/dgc/')) {
    return NextResponse.next(forward);
  }

  return NextResponse.rewrite(new URL('/dgc', request.url), forward);
}

function isLocalDevHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1';
}

export function middleware(request: NextRequest) {
  const forward = { request: { headers: buildForwardedRequestHeaders(request) } };
  const { pathname } = request.nextUrl;

  if (isDgcHost(request)) {
    return handleDgcHost(request, forward);
  }

  if (
    dgcSubdomainEnabled() &&
    !isHubHost(request) &&
    (pathname === '/dgc' || pathname.startsWith('/dgc/'))
  ) {
    return NextResponse.redirect(dgcPublicBase(), 308);
  }

  if (!isHubHost(request)) {
    const host = requestHost(request);
    if (!isLocalDevHost(host) && isFootballHubPathname(pathname)) {
      const dest = footballRouteToGoalLabUrl(pathname, request.nextUrl.search);
      return NextResponse.redirect(dest, 308);
    }
    return NextResponse.next(forward);
  }

  if (pathname === '/' || pathname === '') {
    return NextResponse.rewrite(new URL('/football-predictions', request.url), forward);
  }

  if (PASSTHROUGH_FILES.has(pathname)) {
    return NextResponse.next(forward);
  }

  if (pathname.startsWith('/.well-known/')) {
    return NextResponse.next(forward);
  }

  if (isDirectAppPolicyPath(pathname)) {
    return NextResponse.next(forward);
  }

  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    return NextResponse.next(forward);
  }

  if (isStaticAssetPath(pathname)) {
    return NextResponse.next(forward);
  }

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
    return NextResponse.next(forward);
  }

  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0] ?? '';
  if (first && HUB_FP_SLUG_SET.has(first)) {
    return NextResponse.rewrite(
      new URL(`/football-predictions/${parts.join('/')}`, request.url),
      forward,
    );
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
