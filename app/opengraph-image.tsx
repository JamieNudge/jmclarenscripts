import {
  goalLabOgImageContentType,
  goalLabOgImageSize,
  goalLabOpenGraphImageResponse,
} from '@/lib/goalab-opengraph-image';

export const alt = "Jamie's App Portfolio · GoalLab";

export const size = goalLabOgImageSize;

export const contentType = goalLabOgImageContentType;

export const runtime = 'nodejs';

export default async function Image() {
  return goalLabOpenGraphImageResponse("Jamie's App Portfolio", 'GoalLab');
}
