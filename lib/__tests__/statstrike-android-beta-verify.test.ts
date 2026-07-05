import { describe, expect, it } from 'vitest';
import { statstrikeAndroidBetaMeta } from '@/lib/statstrike-android-beta-meta';
import {
  formatStatStrikeClosedTestReport,
  verifyStatStrikeClosedTestLinks,
} from '@/lib/statstrike-android-beta-verify';

describe('statstrikeAndroidBetaMeta', () => {
  it('defines ordered install steps with required links', () => {
    expect(statstrikeAndroidBetaMeta.installSteps).toHaveLength(4);
    expect(statstrikeAndroidBetaMeta.installSteps[0]?.hrefKey).toBe('googleGroupUrl');
    expect(statstrikeAndroidBetaMeta.installSteps[2]?.hrefKey).toBe('playStoreJoinUrl');
    expect(statstrikeAndroidBetaMeta.installSteps[3]?.hrefKey).toBe('playStoreInstallUrl');
    expect(statstrikeAndroidBetaMeta.accountNote.length).toBeGreaterThan(20);
  });

  it('keeps Play URLs aligned with applicationId', () => {
    expect(statstrikeAndroidBetaMeta.playStoreJoinUrl).toContain(statstrikeAndroidBetaMeta.applicationId);
    expect(statstrikeAndroidBetaMeta.playStoreInstallUrl).toContain(statstrikeAndroidBetaMeta.applicationId);
  });
});

describe('verifyStatStrikeClosedTestLinks', () => {
  it('passes automated external checks for live closed-test URLs', async () => {
    const report = await verifyStatStrikeClosedTestLinks();
    const automated = report.checks.filter((check) => check.status !== 'manual');
    const failed = automated.filter((check) => check.status === 'fail');

    expect(failed, formatStatStrikeClosedTestReport(report)).toEqual([]);
    expect(report.manualPlayConsoleSteps.length).toBeGreaterThan(0);
    expect(report.manualDeviceTestSteps.length).toBeGreaterThan(0);
  }, 20_000);
});
