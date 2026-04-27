import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';
import { loadAndAnotherThingPostsForPublic } from '@/lib/and-another-thing.posts.server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

export async function GET() {
  noStore();
  const posts = await loadAndAnotherThingPostsForPublic();
  return NextResponse.json({ posts }, { headers: noCacheHeaders });
}
