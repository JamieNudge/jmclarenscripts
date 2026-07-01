import { NextResponse } from 'next/server';
import { getWealthDataset } from '@/lib/dgc/wealth-data';

export async function GET() {
  const dataset = getWealthDataset();
  return NextResponse.json(dataset, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
