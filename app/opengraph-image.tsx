import {
  portfolioOgImageContentType,
  portfolioOgImageSize,
  portfolioOpenGraphImageResponse,
} from '@/lib/portfolio-opengraph-image';

export const alt = "Jamie's Portfolio — macOS, iOS & Android developer";

export const size = portfolioOgImageSize;

export const contentType = portfolioOgImageContentType;

export const runtime = 'nodejs';

export default async function Image() {
  return portfolioOpenGraphImageResponse();
}
