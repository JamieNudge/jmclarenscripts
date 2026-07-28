import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STATSTRIKE_WEB_CONFIG,
  normalizeStatStrikeWebConfigPatch,
  parseStatStrikeWebConfig,
} from '@/lib/statstrike/web-config';

describe('statstrike web-config', () => {
  it('defaults pass sales to OFF and blur to ON when missing', () => {
    expect(DEFAULT_STATSTRIKE_WEB_CONFIG.supporterPassSalesEnabled).toBe(false);
    expect(DEFAULT_STATSTRIKE_WEB_CONFIG.blur).toBe(true);
    expect(parseStatStrikeWebConfig(null).supporterPassSalesEnabled).toBe(false);
    expect(parseStatStrikeWebConfig({}).supporterPassSalesEnabled).toBe(false);
  });

  it('parses supporterPassSalesEnabled', () => {
    expect(
      parseStatStrikeWebConfig({ blur: false, supporterPassSalesEnabled: true })
        .supporterPassSalesEnabled,
    ).toBe(true);
    expect(
      parseStatStrikeWebConfig({ supporterPassSalesEnabled: '0' }).supporterPassSalesEnabled,
    ).toBe(false);
  });

  it('defaults researchTagsUiEnabled to OFF', () => {
    expect(DEFAULT_STATSTRIKE_WEB_CONFIG.researchTagsUiEnabled).toBe(false);
    expect(parseStatStrikeWebConfig(null).researchTagsUiEnabled).toBe(false);
    expect(parseStatStrikeWebConfig({}).researchTagsUiEnabled).toBe(false);
  });

  it('parses researchTagsUiEnabled', () => {
    expect(parseStatStrikeWebConfig({ researchTagsUiEnabled: true }).researchTagsUiEnabled).toBe(
      true,
    );
    expect(parseStatStrikeWebConfig({ researchTagsUiEnabled: '0' }).researchTagsUiEnabled).toBe(
      false,
    );
  });

  it('accepts researchTagsUiEnabled patches', () => {
    const ok = normalizeStatStrikeWebConfigPatch({ researchTagsUiEnabled: true });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.patch).toEqual({ researchTagsUiEnabled: true });
    }
  });
});
