import {
  statStrikeOgImageContentType,
  statStrikeOgImageSize,
  statStrikeOpenGraphImageResponse,
} from '@/lib/statstrike-opengraph-image';

export const alt = 'StatStrike · Web app';

export const size = statStrikeOgImageSize;

export const contentType = statStrikeOgImageContentType;

export const runtime = 'nodejs';

export default async function Image() {
  return statStrikeOpenGraphImageResponse('StatStrike', 'Web app');
}
