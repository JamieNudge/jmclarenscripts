import { describe, expect, it } from 'vitest';
import { parseDgcAppearance, resolveDgcTheme } from '../appearance';

describe('parseDgcAppearance', () => {
  it('accepts system, light, and dark', () => {
    expect(parseDgcAppearance('system')).toBe('system');
    expect(parseDgcAppearance('light')).toBe('light');
    expect(parseDgcAppearance('dark')).toBe('dark');
  });

  it('defaults invalid or missing values to system', () => {
    expect(parseDgcAppearance(null)).toBe('system');
    expect(parseDgcAppearance(undefined)).toBe('system');
    expect(parseDgcAppearance('')).toBe('system');
    expect(parseDgcAppearance('auto')).toBe('system');
  });
});

describe('resolveDgcTheme', () => {
  it('resolves explicit preferences regardless of system', () => {
    expect(resolveDgcTheme('light', true)).toBe('light');
    expect(resolveDgcTheme('dark', false)).toBe('dark');
  });

  it('follows system preference when set to system', () => {
    expect(resolveDgcTheme('system', true)).toBe('dark');
    expect(resolveDgcTheme('system', false)).toBe('light');
  });
});
