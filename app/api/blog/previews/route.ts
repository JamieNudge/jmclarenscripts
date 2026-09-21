import { NextResponse } from 'next/server';
import { listPublishedPostPreviews } from '@/lib/blog-server';

export const runtime = 'nodejs';
export const revalidate = 300;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
};

/** Published post summaries only — no markdown bodies. */
export async function GET() {
  const posts = await listPublishedPostPreviews();
  return NextResponse.json({ posts }, { headers: CACHE_HEADERS });
}
