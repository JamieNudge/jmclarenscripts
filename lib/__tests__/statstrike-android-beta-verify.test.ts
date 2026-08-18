import { describe, expect, it } from 'vitest';
import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';
import {
  formatStatStrikeAndroidReport,
  verifyStatStrikeAndroidLinks,
} from '@/lib/statstrike-android-beta-verify';

describe('statstrikeAndroidMeta', () => {
  it('keeps Play URLs aligned with applicationId', () => {
    expect(statstrikeAndroidMeta.playStoreInstallUrl).toContain(statstrikeAndroidMeta.applicationId);
  });
});

describe('verifyStatStrikeAndroidLinks', () => {
  it('passes automated external checks for the live Android listing', async () => {
    const report = await verifyStatStrikeAndroidLinks();
    const automated = report.checks.filter((check) => check.status !== 'manual');
    const failed = automated.filter((check) => check.status === 'fail');

    expect(failed, formatStatStrikeAndroidReport(report)).toEqual([]);
    expect(report.manualPlayConsoleSteps.length).toBeGreaterThan(0);
    expect(report.manualDeviceTestSteps.length).toBeGreaterThan(0);
  }, 20_000);
});
