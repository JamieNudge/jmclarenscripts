import dataset from './dataset.json';
import type { WealthDataset } from './schema';

export const wealthDataset = dataset as unknown as WealthDataset;

export function getWealthDataset(): WealthDataset {
  return wealthDataset;
}
