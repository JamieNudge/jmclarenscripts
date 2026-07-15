import { describe, expect, it } from 'vitest';
import {
  parseHubAppearance,
  resolveHubTheme,
} from '../appearance';

describe('hub appearance', () => {
  it('defaults unknown values to light', () => {
    expect(parseHubAppearance(null)).toBe('light');
    expect(parseHubAppearance('nope')).toBe('light');
  });

  it('resolves system from OS preference', () => {
    expect(resolveHubTheme('system', true)).toBe('dark');
    expect(resolveHubTheme('system', false)).toBe('light');
    expect(resolveHubTheme('light', true)).toBe('light');
    expect(resolveHubTheme('dark', false)).toBe('dark');
  });
});
