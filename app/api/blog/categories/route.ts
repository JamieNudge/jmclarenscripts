import { NextResponse } from 'next/server';
import { categoryLabelBySlug } from '@/lib/blog-server';

export const runtime = 'nodejs';
export const revalidate = 300;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
};

export async function GET() {
  const labelBySlug = await categoryLabelBySlug();
  return NextResponse.json({ labelBySlug }, { headers: CACHE_HEADERS });
}
