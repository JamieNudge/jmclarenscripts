import {
  goalLabOgImageContentType,
  goalLabOgImageSize,
  goalLabOpenGraphImageResponse,
} from '@/lib/goalab-opengraph-image';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

export const alt = `${FOOTBALL_PREDICTIONS_PAGE_TITLE} · GoalLab`;

export const size = goalLabOgImageSize;

export const contentType = goalLabOgImageContentType;

export const runtime = 'nodejs';

export default async function Image() {
  return goalLabOpenGraphImageResponse(FOOTBALL_PREDICTIONS_PAGE_TITLE, 'GoalLab');
}
